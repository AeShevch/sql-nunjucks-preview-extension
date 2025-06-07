import * as vscode from 'vscode';
import { DocumentWatcher } from '@infrastructure/DocumentWatcher/types';
import { SqlDocument } from '@domain/entities/SqlDocument/types';
import { injectable } from 'tsyringe';

@injectable()
export class VsCodeDocumentWatcher implements DocumentWatcher {
  private disposable: vscode.Disposable | undefined;

  public watch(callback: (document: SqlDocument) => void): void {
    this.disposable = vscode.workspace.onDidChangeTextDocument(event => {
      const document = event.document;
      if (document.fileName.endsWith('.sql')) {
        const sqlDocument: SqlDocument = {
          fileName: document.fileName,
          content: document.getText(),
        };
        callback(sqlDocument);
      }
    });
  }

  public dispose(): void {
    if (this.disposable) {
      this.disposable.dispose();
      this.disposable = undefined;
    }
  }
}
