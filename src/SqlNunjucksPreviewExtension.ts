import 'reflect-metadata';
import * as vscode from 'vscode';
import { injectable, inject } from 'tsyringe';
import { PreviewService } from '@application/PreviewService/PreviewService';
import { VsCodeDocumentWatcher } from '@infrastructure/DocumentWatcher/DocumentWatcher';
import {
  ShowPreviewCommand,
  ShowFullRenderCommand,
  CommandRegistry,
} from '@commands/PreviewCommands/PreviewCommands';
import { SqlDocument } from '@domain/entities/SqlDocument/types';

@injectable()
export class SqlNunjucksPreviewExtension {
  constructor(
    @inject(PreviewService) private readonly previewService: PreviewService,
    @inject(VsCodeDocumentWatcher) private readonly documentWatcher: VsCodeDocumentWatcher,
    @inject(CommandRegistry) private readonly commandRegistry: CommandRegistry,
    @inject(ShowPreviewCommand) private readonly showPreviewCommand: ShowPreviewCommand,
    @inject(ShowFullRenderCommand) private readonly showFullRenderCommand: ShowFullRenderCommand
  ) {}

  public activate(context: vscode.ExtensionContext): void {
    try {
      this.registerUICommands(context);
      this.registerDocumentUpdateWatcher(context);

      vscode.window.showInformationMessage('SQL Nunjucks Preview extension activated!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Extension activation error: ${errorMessage}`);
    }
  }

  public deactivate(): void {
    this.previewService?.dispose();
    this.documentWatcher?.dispose();
  }

  private registerUICommands(context: vscode.ExtensionContext): void {
    const disposables = [
      this.commandRegistry.register('sqlNunjucksPreview.showPreview', this.showPreviewCommand),
      this.commandRegistry.register(
        'sqlNunjucksPreview.showFullRender',
        this.showFullRenderCommand
      ),
    ];

    context.subscriptions.push(...disposables);
  }

  private registerDocumentUpdateWatcher(context: vscode.ExtensionContext): void {
    this.documentWatcher.watch((document: SqlDocument) => {
      this.previewService.updatePreview(document);
    });

    context.subscriptions.push(this.documentWatcher);
  }
}
