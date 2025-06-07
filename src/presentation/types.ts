import * as vscode from 'vscode';
import { SqlDocument } from '@domain/entities/types';

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
  dispose(): void;
}

export interface ContentRenderer {
  renderPreview(sql: string, fileName: string, options: PreviewOptions): string;
  renderError(error: string): string;
} 