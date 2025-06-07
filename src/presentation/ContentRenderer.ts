import * as path from 'path';
import { ContentRenderer, PreviewOptions } from '../types';

export class HtmlContentRenderer implements ContentRenderer {
    renderPreview(sql: string, fileName: string, options: PreviewOptions): string {
        const variablesSection = options.variables ? `
            <div class="variables-section">
                <h3>Переменные для рендеринга:</h3>
                <pre><code>${JSON.stringify(options.variables, null, 2)}</code></pre>
            </div>
        ` : '';

        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${options.isFullRender ? 'SQL Full Render' : 'SQL Preview'} - ${fileName}</title>
            <style>
                ${this.getStyles()}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${options.isFullRender ? '🔧 SQL Full Render' : '📋 SQL Preview'} - ${fileName}</h1>
                <p>${options.isFullRender ? 'Полностью обработанный SQL с подставленными переменными' : 'SQL с развернутыми включениями'}</p>
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

    renderError(error: string): string {
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

    private getStyles(): string {
        return `
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
        `;
    }

    private highlightSql(sql: string): string {
        return sql
            .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INDEX|TABLE|DATABASE|IF|ELSE|CASE|WHEN|THEN|END|AS|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|COUNT|SUM|AVG|MIN|MAX|DISTINCT|LIMIT|OFFSET)\b/gi, '<span class="sql-keyword">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="sql-comment">$1</span>')
            .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="sql-string">$1</span>');
    }
} 