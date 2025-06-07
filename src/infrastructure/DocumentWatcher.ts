import * as vscode from 'vscode';
import { DocumentWatcher, SqlDocument } from '../types';

export class VsCodeDocumentWatcher implements DocumentWatcher {
    private disposable: vscode.Disposable | undefined;

    watch(callback: (document: SqlDocument) => void): void {
        this.disposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            if (document.fileName.endsWith('.sql')) {
                const sqlDocument: SqlDocument = {
                    fileName: document.fileName,
                    content: document.getText()
                };
                callback(sqlDocument);
            }
        });
    }

    dispose(): void {
        if (this.disposable) {
            this.disposable.dispose();
            this.disposable = undefined;
        }
    }
} 