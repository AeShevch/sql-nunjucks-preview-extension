import * as vscode from 'vscode';
import * as path from 'path';
import { WebViewManager, SqlDocument, PreviewOptions, ContentRenderer } from '../types';

export interface WebViewFactory {
    createWebView(title: string): vscode.WebviewPanel;
}

export class VsCodeWebViewFactory implements WebViewFactory {
    createWebView(title: string): vscode.WebviewPanel {
        return vscode.window.createWebviewPanel(
            'sqlNunjucksPreview',
            title,
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );
    }
}

export class VsCodeWebViewManager implements WebViewManager {
    private webviewPanels: Map<string, vscode.WebviewPanel> = new Map();
    private updateTimeouts: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        private webViewFactory: WebViewFactory,
        private contentRenderer: ContentRenderer
    ) {}

    showPreview(document: SqlDocument, options: PreviewOptions): void {
        const panelKey = this.generatePanelKey(document, options);
        let panel = this.webviewPanels.get(panelKey);

        if (panel) {
            panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        const title = this.generateTitle(document, options);
        panel = this.webViewFactory.createWebView(title);

        panel.onDidDispose(() => {
            this.webviewPanels.delete(panelKey);
        });

        this.webviewPanels.set(panelKey, panel);
        this.updatePanelContent(panel, document, options);
    }

    updatePreview(document: SqlDocument, options: PreviewOptions): void {
        const fileName = document.fileName;
        const existingTimeout = this.updateTimeouts.get(fileName);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
            this.performUpdatePreview(document, options);
            this.updateTimeouts.delete(fileName);
        }, 300);

        this.updateTimeouts.set(fileName, timeout);
    }

    dispose(): void {
        this.updateTimeouts.forEach(timeout => {
            clearTimeout(timeout);
        });
        this.updateTimeouts.clear();

        this.webviewPanels.forEach(panel => {
            panel.dispose();
        });
        this.webviewPanels.clear();
    }

    private generatePanelKey(document: SqlDocument, options: PreviewOptions): string {
        return `${document.fileName}-${options.isFullRender ? 'full' : 'simple'}`;
    }

    private generateTitle(document: SqlDocument, options: PreviewOptions): string {
        const fileName = path.basename(document.fileName);
        return options.isFullRender
            ? `SQL Full Render - ${fileName}`
            : `SQL Preview - ${fileName}`;
    }

    private updatePanelContent(panel: vscode.WebviewPanel, document: SqlDocument, options: PreviewOptions): void {
        const fileName = path.basename(document.fileName);
        panel.webview.html = this.contentRenderer.renderPreview(document.content, fileName, options);
    }

    private performUpdatePreview(document: SqlDocument, options: PreviewOptions): void {
        const simplePreviewKey = `${document.fileName}-simple`;
        const fullRenderKey = `${document.fileName}-full`;

        const simplePanel = this.webviewPanels.get(simplePreviewKey);
        if (simplePanel) {
            this.updatePanelContent(simplePanel, document, { isFullRender: false });
        }

        const fullPanel = this.webviewPanels.get(fullRenderKey);
        if (fullPanel) {
            const storedVariables = (fullPanel as any)._storedVariables;
            if (storedVariables) {
                this.updatePanelContent(fullPanel, document, { 
                    isFullRender: true, 
                    variables: storedVariables 
                });
            }
        }
    }

    public updatePanelWithProcessedContent(document: SqlDocument, options: PreviewOptions, processedContent: string): void {
        const panelKey = this.generatePanelKey(document, options);
        const panel = this.webviewPanels.get(panelKey);
        
        if (panel) {
            const fileName = path.basename(document.fileName);
            panel.webview.html = this.contentRenderer.renderPreview(processedContent, fileName, options);
            
            if (options.variables) {
                (panel as any)._storedVariables = options.variables;
            }
        }
    }

    public updatePanelWithError(document: SqlDocument, options: PreviewOptions, error: string): void {
        const panelKey = this.generatePanelKey(document, options);
        const panel = this.webviewPanels.get(panelKey);
        
        if (panel) {
            panel.webview.html = this.contentRenderer.renderError(error);
        }
    }
} 