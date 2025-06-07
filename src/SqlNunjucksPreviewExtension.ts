import "reflect-metadata";
import * as vscode from "vscode";
import { autoInjectable, inject } from "tsyringe";
import { PreviewService } from "./application/PreviewService";
import { VsCodeDocumentWatcher } from "./infrastructure/DocumentWatcher";
import { ShowPreviewCommand, ShowFullRenderCommand, CommandRegistry } from "./commands/PreviewCommands";

@autoInjectable()
export class SqlNunjucksPreviewExtension {
    constructor(
        @inject(PreviewService) private readonly previewService: PreviewService,
        @inject(VsCodeDocumentWatcher) private readonly documentWatcher: VsCodeDocumentWatcher,
        @inject(CommandRegistry) private readonly commandRegistry: CommandRegistry,
        @inject(ShowPreviewCommand) private readonly showPreviewCommand: ShowPreviewCommand,
        @inject(ShowFullRenderCommand) private readonly showFullRenderCommand: ShowFullRenderCommand
    ) {}

    activate(context: vscode.ExtensionContext): void {
        try {
            const disposables = [
                this.commandRegistry.register('sqlNunjucksPreview.showPreview', this.showPreviewCommand),
                this.commandRegistry.register('sqlNunjucksPreview.showFullRender', this.showFullRenderCommand)
            ];

            this.documentWatcher.watch((document) => {
                this.previewService.updatePreview(document);
            });

            context.subscriptions.push(...disposables, this.documentWatcher);

            vscode.window.showInformationMessage('SQL Nunjucks Preview расширение активировано!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            vscode.window.showErrorMessage(`Ошибка активации расширения: ${errorMessage}`);
        }
    }

    deactivate(): void {
        if (this.previewService) {
            this.previewService.dispose();
        }
        
        if (this.documentWatcher) {
            this.documentWatcher.dispose();
        }
    }
}