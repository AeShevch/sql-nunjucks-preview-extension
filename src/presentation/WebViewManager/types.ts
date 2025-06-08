import * as vscode from 'vscode';
import { SqlDocument } from '@domain/entities/SqlDocument/types';

export interface WebViewFactory {
  createWebView(title: string): vscode.WebviewPanel;
}

export interface PreviewOptions {
  isFullRender: boolean;
  variables?: Record<string, any>;
}

export interface WebViewManager {
  showPreview(document: SqlDocument, options: PreviewOptions): void;
  updatePreview(document: SqlDocument, options: PreviewOptions): void;
  setVariablesChangedCallback(
    callback: (document: SqlDocument, variables: Record<string, any>) => void
  ): void;
  getStoredVariables(document: SqlDocument): Record<string, any> | undefined;
  dispose(): void;
}
