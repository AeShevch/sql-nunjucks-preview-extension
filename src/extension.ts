import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as nunjucks from 'nunjucks';

let sqlProcessor: SqlNunjucksProcessor;

export function activate(context: vscode.ExtensionContext): void {
    try {
        sqlProcessor = new SqlNunjucksProcessor();

        const showPreviewCommand = vscode.commands.registerCommand(
            'sqlNunjucksPreview.showPreview',
            () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor || !editor.document.fileName.endsWith('.sql')) {
                    vscode.window.showErrorMessage('Откройте SQL файл для предварительного просмотра');
                    return;
                }
                sqlProcessor.showPreview(editor.document, false);
            }
        );

        const showFullRenderCommand = vscode.commands.registerCommand(
            'sqlNunjucksPreview.showFullRender',
            async () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor || !editor.document.fileName.endsWith('.sql')) {
                    vscode.window.showErrorMessage('Откройте SQL файл для предварительного просмотра');
                    return;
                }
                await sqlProcessor.showFullRender(editor.document);
            }
        );

        // Добавляем наблюдатель за изменениями документов
        const documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            if (document.fileName.endsWith('.sql')) {
                sqlProcessor.updatePreview(document);
            }
        });

        context.subscriptions.push(showPreviewCommand, showFullRenderCommand, documentChangeListener);

        vscode.window.showInformationMessage('SQL Nunjucks Preview расширение активировано!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        vscode.window.showErrorMessage(`Ошибка активации расширения: ${errorMessage}`);
    }
}

export function deactivate(): void {
    // Очищаем ресурсы при деактивации расширения
    if (sqlProcessor) {
        sqlProcessor.dispose();
    }
}

class SqlNunjucksProcessor {
    private webviewPanels: Map<string, vscode.WebviewPanel> = new Map();
    private updateTimeouts: Map<string, NodeJS.Timeout> = new Map();

    public showPreview(document: vscode.TextDocument, isFullRender: boolean = false): void {
        const panelKey = `${document.fileName}-${isFullRender ? 'full' : 'simple'}`;

        let panel = this.webviewPanels.get(panelKey);

        if (panel) {
            panel.reveal(vscode.ViewColumn.Beside);
        } else {
            const title = isFullRender
                ? `SQL Full Render - ${path.basename(document.fileName)}`
                : `SQL Preview - ${path.basename(document.fileName)}`;

            panel = vscode.window.createWebviewPanel(
                'sqlNunjucksPreview',
                title,
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            panel.onDidDispose(() => {
                this.webviewPanels.delete(panelKey);
            });

            this.webviewPanels.set(panelKey, panel);
        }

        try {
            const processedSql = this.processIncludes(document.fileName, document.getText());
            panel.webview.html = this.generateWebviewContent(processedSql, path.basename(document.fileName));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            panel.webview.html = this.generateErrorContent(errorMessage);
        }
    }

    public async showFullRender(document: vscode.TextDocument): Promise<void> {
        // Сначала показываем простой превью с включениями
        this.showPreview(document, false);

        // Получаем параметры для полного рендера
        const variables = await this.getVariablesFromUser();
        if (!variables) {
            return;
        }

        const panelKey = `${document.fileName}-full`;
        let panel = this.webviewPanels.get(panelKey);

        if (!panel) {
            panel = vscode.window.createWebviewPanel(
                'sqlNunjucksFullRender',
                `SQL Full Render - ${path.basename(document.fileName)}`,
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            panel.onDidDispose(() => {
                this.webviewPanels.delete(panelKey);
            });

            this.webviewPanels.set(panelKey, panel);
        }

        try {
            const processedSql = this.processIncludes(document.fileName, document.getText());
            const renderedSql = this.renderTemplate(processedSql, variables);
            panel.webview.html = this.generateWebviewContent(renderedSql, path.basename(document.fileName), true, variables);

            // Сохраняем переменные в панели для обновлений
            (panel as any)._storedVariables = variables;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            panel.webview.html = this.generateErrorContent(errorMessage);
        }
    }

    private processIncludes(filePath: string, content: string): string {
        const baseDir = path.dirname(filePath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        const workspaceRoot = workspaceFolder?.uri.fsPath || '';

        return this.processIncludesRecursive(content, baseDir, workspaceRoot, new Set());
    }

    private processIncludesRecursive(content: string, baseDir: string, workspaceRoot: string, processedFiles: Set<string>): string {
        const includeRegex = /{%\s*include\s+['"]([^'"]+)['"]\s*%}/g;

        return content.replace(includeRegex, (match, includePath) => {
            // Все пути разрешаются относительно папки clickhouse/sqls
            let fullIncludePath: string;

            // Определяем базовую папку sqls
            const sqlsBaseDir = path.join(workspaceRoot, 'clickhouse', 'sqls');

            if (includePath.startsWith('/')) {
                // Абсолютный путь от корня sqls (убираем ведущий слеш)
                fullIncludePath = path.join(sqlsBaseDir, includePath.substring(1));
            } else {
                // Относительный путь от папки sqls
                fullIncludePath = path.join(sqlsBaseDir, includePath);
            }

            // Проверяем на циклические включения
            if (processedFiles.has(fullIncludePath)) {
                return `/* ЦИКЛИЧЕСКОЕ ВКЛЮЧЕНИЕ: ${includePath} */`;
            }

            try {
                if (!fs.existsSync(fullIncludePath)) {
                    return `/* ФАЙЛ НЕ НАЙДЕН: ${includePath} (искали в ${fullIncludePath}) */`;
                }

                const includeContent = fs.readFileSync(fullIncludePath, 'utf8');
                processedFiles.add(fullIncludePath);

                // Рекурсивно обрабатываем включения в подключаемом файле
                // Передаем sqlsBaseDir как baseDir для корректного разрешения вложенных путей
                const processedInclude = this.processIncludesRecursive(
                    includeContent,
                    sqlsBaseDir,
                    workspaceRoot,
                    new Set(processedFiles)
                );

                processedFiles.delete(fullIncludePath);

                return `\n/* === ВКЛЮЧЕНО ИЗ: ${includePath} === */\n${processedInclude}\n/* === КОНЕЦ ВКЛЮЧЕНИЯ: ${includePath} === */\n`;
            } catch (error) {
                return `/* ОШИБКА ВКЛЮЧЕНИЯ: ${includePath} - ${error instanceof Error ? error.message : 'Неизвестная ошибка'} */`;
            }
        });
    }

    private renderTemplate(sql: string, variables: Record<string, any>): string {
        try {
            const env = new nunjucks.Environment();
            return env.renderString(sql, variables);
        } catch (error) {
            throw new Error(`Ошибка рендеринга шаблона: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }

    private async getVariablesFromUser(): Promise<Record<string, any> | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Введите переменные для рендеринга в формате JSON',
            placeHolder: '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
            value: '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
        });

        if (!input) {
            return undefined;
        }

        try {
            return JSON.parse(input);
        } catch (error) {
            vscode.window.showErrorMessage('Неверный формат JSON');
            return undefined;
        }
    }

    private generateWebviewContent(sql: string, fileName: string, isFullRender: boolean = false, variables?: Record<string, any>): string {
        const variablesSection = variables ? `
            <div class="variables-section">
                <h3>Переменные для рендеринга:</h3>
                <pre><code>${JSON.stringify(variables, null, 2)}</code></pre>
            </div>
        ` : '';

        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${isFullRender ? 'SQL Full Render' : 'SQL Preview'} - ${fileName}</title>
            <style>
                body {
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .header {
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .sql-content {
                    background-color: var(--vscode-textCodeBlock-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 15px;
                    white-space: pre-wrap;
                    font-size: 14px;
                    overflow-x: auto;
                }
                .variables-section {
                    background-color: var(--vscode-textBlockQuote-background);
                    border: 1px solid var(--vscode-textBlockQuote-border);
                    border-radius: 4px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .variables-section h3 {
                    margin-top: 0;
                    color: var(--vscode-textPreformat-foreground);
                }
                .variables-section pre {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                h1 {
                    color: var(--vscode-textPreformat-foreground);
                    margin-top: 0;
                }
                .auto-update-indicator {
                    margin-top: 10px;
                    padding: 5px 10px;
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    border-radius: 3px;
                    display: inline-block;
                }
                .sql-keyword {
                    color: #569cd6;
                    font-weight: bold;
                }
                .sql-comment {
                    color: #6a9955;
                    font-style: italic;
                }
                .sql-string {
                    color: #ce9178;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${isFullRender ? '🔧 SQL Full Render' : '📋 SQL Preview'} - ${fileName}</h1>
                <p>${isFullRender ? 'Полностью обработанный SQL с подставленными переменными' : 'SQL с развернутыми включениями'}</p>
                <div class="auto-update-indicator">
                    <small>🔄 Автоматически обновляется при изменении файла</small>
                </div>
            </div>
             ${variablesSection}
            <div class="sql-content">${this.highlightSql(sql)}</div>
        </body>
        </html>
        `;
    }

    private generateErrorContent(error: string): string {
        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ошибка</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .error {
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                    border-radius: 4px;
                    padding: 15px;
                    color: var(--vscode-inputValidation-errorForeground);
                }
            </style>
        </head>
        <body>
            <div class="error">
                <h2>❌ Ошибка обработки SQL</h2>
                <p>${error}</p>
            </div>
        </body>
        </html>
        `;
    }

    private highlightSql(sql: string): string {
        // Простая подсветка SQL синтаксиса
        return sql
            .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INDEX|TABLE|DATABASE|IF|ELSE|CASE|WHEN|THEN|END|AS|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|COUNT|SUM|AVG|MIN|MAX|DISTINCT|LIMIT|OFFSET)\b/gi, '<span class="sql-keyword">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="sql-comment">$1</span>')
            .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="sql-string">$1</span>');
    }

    public updatePreview(document: vscode.TextDocument): void {
        // Дебаунсинг для избежания слишком частых обновлений
        const fileName = document.fileName;
        const existingTimeout = this.updateTimeouts.get(fileName);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // Задержка 300ms
        const timeout = setTimeout(() => {
            this.performUpdatePreview(document);
            this.updateTimeouts.delete(fileName);
        }, 300);

        this.updateTimeouts.set(fileName, timeout);
    }

    private performUpdatePreview(document: vscode.TextDocument): void {
        // Обновляем все открытые панели для данного документа
        const simplePreviewKey = `${document.fileName}-simple`;
        const fullRenderKey = `${document.fileName}-full`;

        // Обновляем простой превью, если он открыт
        const simplePanel = this.webviewPanels.get(simplePreviewKey);
        if (simplePanel) {
            try {
                const processedSql = this.processIncludes(document.fileName, document.getText());
                simplePanel.webview.html = this.generateWebviewContent(processedSql, path.basename(document.fileName));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
                simplePanel.webview.html = this.generateErrorContent(errorMessage);
            }
        }

        // Обновляем полный рендер, если он открыт
        const fullPanel = this.webviewPanels.get(fullRenderKey);
        if (fullPanel) {
            // Для полного рендера нужны переменные, которые мы сохраняем в панели
            const storedVariables = (fullPanel as any)._storedVariables;
            if (storedVariables) {
                try {
                    const processedSql = this.processIncludes(document.fileName, document.getText());
                    const renderedSql = this.renderTemplate(processedSql, storedVariables);
                    fullPanel.webview.html = this.generateWebviewContent(renderedSql, path.basename(document.fileName), true, storedVariables);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
                    fullPanel.webview.html = this.generateErrorContent(errorMessage);
                }
            }
        }
    }

    public dispose(): void {
        // Очищаем все таймауты
        this.updateTimeouts.forEach(timeout => {
            clearTimeout(timeout);
        });
        this.updateTimeouts.clear();

        // Закрываем все открытые панели
        this.webviewPanels.forEach(panel => {
            panel.dispose();
        });
        this.webviewPanels.clear();
    }
}
