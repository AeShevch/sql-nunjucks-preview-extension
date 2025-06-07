import * as vscode from 'vscode';
import * as path from 'path';
import { WebViewManager, PreviewOptions, WebViewFactory } from '@presentation/WebViewManager/types';
import { SqlDocument } from '@domain/entities/SqlDocument/types';
import { inject, singleton } from 'tsyringe';
import { ReactContentRenderer } from '@presentation/ContentRenderer/ReactContentRenderer';
import { VsCodeWebViewFactory } from '@presentation/WebViewManager/WebViewFactory';

@singleton()
export class VsCodeWebViewManager implements WebViewManager {
  private webviewPanels: Map<string, vscode.WebviewPanel> = new Map();
  private updateTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private variablesChangedCallback?: (document: SqlDocument, variables: Record<string, any>) => void;

  constructor(
    @inject(VsCodeWebViewFactory) private webViewFactory: WebViewFactory,
    @inject(ReactContentRenderer) private contentRenderer: ReactContentRenderer
  ) {}

  public setVariablesChangedCallback(callback: (document: SqlDocument, variables: Record<string, any>) => void): void {
    this.variablesChangedCallback = callback;
  }

  public showPreview(document: SqlDocument, options: PreviewOptions): void {
    const panelKey = this.generatePanelKey(document, options);
    let panel = this.webviewPanels.get(panelKey);

    if (panel) {
      panel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    const title = this.generateTitle(document, options);
    panel = this.webViewFactory.createWebView(title);

    panel.webview.onDidReceiveMessage((message) => {
      if (message.type === 'variablesChanged' && this.variablesChangedCallback) {
        this.variablesChangedCallback(document, message.variables);
      }
    });

    panel.onDidDispose(() => {
      this.webviewPanels.delete(panelKey);
    });

    this.webviewPanels.set(panelKey, panel);
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
    return options.isFullRender ? `SQL Full Render - ${fileName}` : `SQL Preview - ${fileName}`;
  }

  private updatePanelContent(
    panel: vscode.WebviewPanel,
    document: SqlDocument,
    options: PreviewOptions
  ): void {
    const fileName = path.basename(document.fileName);
    const html = this.contentRenderer.renderPreview(document.content, fileName, options);
    panel.webview.html = html;
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
          variables: storedVariables,
        });
      }
    }
  }

  public updatePanelWithProcessedContent(
    document: SqlDocument,
    options: PreviewOptions,
    processedContent: string
  ): void {
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
