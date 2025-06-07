import * as vscode from 'vscode';
import { SqlDocument } from '@domain/entities/SqlDocument/types';
import { PreviewService } from '@application/PreviewService/PreviewService';
import { injectable, inject } from 'tsyringe';
import { Command } from '@commands/PreviewCommands/types';

@injectable()
export class ShowPreviewCommand implements Command {
  constructor(@inject(PreviewService) private previewService: PreviewService) {}

  public async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!this.validateEditor(editor)) {
      return;
    }

    await this.previewService.showPreview({
      fileName: editor.document.fileName,
      content: editor.document.getText(),
    });
  }

  private validateEditor(editor: vscode.TextEditor | undefined): editor is vscode.TextEditor {
    if (!editor || !editor.document.fileName.endsWith('.sql')) {
      vscode.window.showErrorMessage('Please open an SQL file for preview');
      return false;
    }
    return true;
  }
}

@injectable()
export class ShowFullRenderCommand implements Command {
  constructor(@inject(PreviewService) private previewService: PreviewService) {}

  public async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!this.validateEditor(editor)) {
      return;
    }

    const document: SqlDocument = {
      fileName: editor.document.fileName,
      content: editor.document.getText(),
    };

    await this.previewService.showFullRender(document);
  }

  private validateEditor(editor: vscode.TextEditor | undefined): editor is vscode.TextEditor {
    if (!editor || !editor.document.fileName.endsWith('.sql')) {
      vscode.window.showErrorMessage('Please open an SQL file for preview');
      return false;
    }
    return true;
  }
}

@injectable()
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  public register(commandId: string, command: Command): vscode.Disposable {
    this.commands.set(commandId, command);
    return vscode.commands.registerCommand(commandId, () => command.execute());
  }

  public getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId);
  }
}
