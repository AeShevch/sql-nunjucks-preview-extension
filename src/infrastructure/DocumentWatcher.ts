import * as vscode from 'vscode';
import { DocumentWatcher, SqlDocument } from '@types';
import { injectable } from 'tsyringe';

@injectable()
export class VsCodeDocumentWatcher implements DocumentWatcher {
    private disposable: vscode.Disposable | undefined;

    public watch(callback: (document: SqlDocument) => void): void {
        console.log('[DocumentWatcher] Starting to watch for text document changes');
        this.disposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            console.log('[DocumentWatcher] Document changed:', document.fileName);
            if (document.fileName.endsWith('.sql')) {
                console.log('[DocumentWatcher] SQL document detected, triggering callback');
                const sqlDocument: SqlDocument = {
                    fileName: document.fileName,
                    content: document.getText()
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