import * as vscode from 'vscode';
import * as path from 'path';
import { WebViewManager, SqlDocument, PreviewOptions, ContentRenderer } from '@types';
import { injectable, inject, singleton } from 'tsyringe';
import { HtmlContentRenderer } from '@presentation/ContentRenderer';

export interface WebViewFactory {
    createWebView(title: string): vscode.WebviewPanel;
}

@singleton()
export class VsCodeWebViewFactory implements WebViewFactory {
    public createWebView(title: string): vscode.WebviewPanel {
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

@singleton()
export class VsCodeWebViewManager implements WebViewManager {
    private webviewPanels: Map<string, vscode.WebviewPanel> = new Map();
    private updateTimeouts: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        @inject(VsCodeWebViewFactory) private webViewFactory: WebViewFactory,
        @inject(HtmlContentRenderer) private contentRenderer: HtmlContentRenderer
    ) {
        console.log('[WebViewManager] Constructor called, creating new Maps');
    }

    public showPreview(document: SqlDocument, options: PreviewOptions): void {
        console.log('[WebViewManager] showPreview called for:', document.fileName, 'isFullRender:', options.isFullRender);
        const panelKey = this.generatePanelKey(document, options);
        console.log('[WebViewManager] Generated panel key:', panelKey);
        let panel = this.webviewPanels.get(panelKey);

        if (panel) {
            console.log('[WebViewManager] Existing panel found, revealing it');
            panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        console.log('[WebViewManager] Creating new panel');
        const title = this.generateTitle(document, options);
        panel = this.webViewFactory.createWebView(title);

        panel.onDidDispose(() => {
            console.log('[WebViewManager] Panel disposed, removing from map:', panelKey);
            console.log('[WebViewManager] Map before deletion:', Array.from(this.webviewPanels.keys()));
            this.webviewPanels.delete(panelKey);
            console.log('[WebViewManager] Map after deletion:', Array.from(this.webviewPanels.keys()));
        });

        this.webviewPanels.set(panelKey, panel);
        console.log('[WebViewManager] Panel stored in map, available panels:', Array.from(this.webviewPanels.keys()));
        this.updatePanelContent(panel, document, options);
    }

    public updatePreview(document: SqlDocument, options: PreviewOptions): void {
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

    public dispose(): void {
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
        console.log('[WebViewManager] updatePanelWithProcessedContent called for:', document.fileName);
        console.log('[WebViewManager] Current Map size:', this.webviewPanels.size);
        const panelKey = this.generatePanelKey(document, options);
        console.log('[WebViewManager] Looking for panel with key:', panelKey);
        const panel = this.webviewPanels.get(panelKey);
        
        if (panel) {
            console.log('[WebViewManager] Panel found, updating HTML content');
            const fileName = path.basename(document.fileName);
            panel.webview.html = this.contentRenderer.renderPreview(processedContent, fileName, options);
            console.log('[WebViewManager] HTML content updated successfully');
            
            if (options.variables) {
                (panel as any)._storedVariables = options.variables;
            }
        } else {
            console.log('[WebViewManager] Panel not found! Available panels:', Array.from(this.webviewPanels.keys()));
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