import { WebViewFactory } from '@presentation/WebViewManager/types';
import { singleton } from 'tsyringe';
import * as vscode from 'vscode';

@singleton()
export class VsCodeWebViewFactory implements WebViewFactory {
  public createWebView(title: string): vscode.WebviewPanel {
    return vscode.window.createWebviewPanel('sqlNunjucksPreview', title, vscode.ViewColumn.Beside, {
      enableScripts: true,
      retainContextWhenHidden: true,
    });
  }
}
