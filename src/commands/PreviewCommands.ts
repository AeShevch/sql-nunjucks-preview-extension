import * as vscode from 'vscode';
import { SqlDocument } from '../types';
import { PreviewService } from '../application/PreviewService';
import { injectable, inject } from 'tsyringe';

export interface Command {
    execute(): Promise<void>;
}

@injectable()
export class ShowPreviewCommand implements Command {
    constructor(@inject(PreviewService) private previewService: PreviewService) {}

    async execute(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!this.validateEditor(editor)) {
            return;
        }

        const document: SqlDocument = {
            fileName: editor.document.fileName,
            content: editor.document.getText()
        };

        await this.previewService.showPreview(document);
    }

    private validateEditor(editor: vscode.TextEditor | undefined): editor is vscode.TextEditor {
        if (!editor || !editor.document.fileName.endsWith('.sql')) {
            vscode.window.showErrorMessage('Откройте SQL файл для предварительного просмотра');
            return false;
        }
        return true;
    }
}

@injectable()
export class ShowFullRenderCommand implements Command {
    constructor(@inject(PreviewService) private previewService: PreviewService) {}

    async execute(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!this.validateEditor(editor)) {
            return;
        }

        const document: SqlDocument = {
            fileName: editor.document.fileName,
            content: editor.document.getText()
        };

        await this.previewService.showFullRender(document);
    }

    private validateEditor(editor: vscode.TextEditor | undefined): editor is vscode.TextEditor {
        if (!editor || !editor.document.fileName.endsWith('.sql')) {
            vscode.window.showErrorMessage('Откройте SQL файл для предварительного просмотра');
            return false;
        }
        return true;
    }
}

@injectable()
export class CommandRegistry {
    private commands: Map<string, Command> = new Map();

    register(commandId: string, command: Command): vscode.Disposable {
        this.commands.set(commandId, command);
        return vscode.commands.registerCommand(commandId, () => command.execute());
    }

    getCommand(commandId: string): Command | undefined {
        return this.commands.get(commandId);
    }
} 