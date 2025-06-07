import "reflect-metadata";
import * as vscode from "vscode";
import { injectable, inject } from "tsyringe";
import { PreviewService } from "@application/PreviewService";
import { VsCodeDocumentWatcher } from "@infrastructure/DocumentWatcher";
import { ShowPreviewCommand, ShowFullRenderCommand, CommandRegistry } from "@commands/PreviewCommands";

@injectable()
export class SqlNunjucksPreviewExtension {
    constructor(
        @inject(PreviewService) private readonly previewService: PreviewService,
        @inject(VsCodeDocumentWatcher) private readonly documentWatcher: VsCodeDocumentWatcher,
        @inject(CommandRegistry) private readonly commandRegistry: CommandRegistry,
        @inject(ShowPreviewCommand) private readonly showPreviewCommand: ShowPreviewCommand,
        @inject(ShowFullRenderCommand) private readonly showFullRenderCommand: ShowFullRenderCommand
    ) {
        console.log('[SqlNunjucksPreviewExtension] Constructor called, all dependencies injected');
    }

    public activate(context: vscode.ExtensionContext): void {
        console.log('[SqlNunjucksPreviewExtension] activate() method called');
        try {
            const disposables = [
                this.commandRegistry.register('sqlNunjucksPreview.showPreview', this.showPreviewCommand),
                this.commandRegistry.register('sqlNunjucksPreview.showFullRender', this.showFullRenderCommand)
            ];

            console.log('[SqlNunjucksPreviewExtension] Setting up document watcher');
            this.documentWatcher.watch((document) => {
                console.log('[SqlNunjucksPreviewExtension] Document watcher callback triggered for:', document.fileName);
                this.previewService.updatePreview(document);
            });

            context.subscriptions.push(...disposables, this.documentWatcher);

            vscode.window.showInformationMessage('SQL Nunjucks Preview extension activated!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Extension activation error: ${errorMessage}`);
        }
    }

    public deactivate(): void {
        if (this.previewService) {
            this.previewService.dispose();
        }
        
        if (this.documentWatcher) {
            this.documentWatcher.dispose();
        }
    }
}