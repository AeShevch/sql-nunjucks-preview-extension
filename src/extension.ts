import * as vscode from 'vscode';

import { VsCodeFileSystemAdapter } from './infrastructure/FileSystemAdapter';
import { NunjucksTemplateRenderer } from './infrastructure/NunjucksAdapter';
import { VsCodeVariableProvider } from './infrastructure/VsCodeVariableProvider';
import { VsCodeDocumentWatcher } from './infrastructure/DocumentWatcher';

import { SqlIncludeResolver } from './domain/IncludeResolver';
import { SqlProcessor } from './domain/SqlProcessor';

import { HtmlContentRenderer } from './presentation/ContentRenderer';
import { VsCodeWebViewManager, VsCodeWebViewFactory } from './presentation/WebViewManager';

import { PreviewService } from './application/PreviewService';

import { ShowPreviewCommand, ShowFullRenderCommand, CommandRegistry } from './commands/PreviewCommands';

import { DIContainer } from './container/DIContainer';

import { 
    FileSystemAdapter, 
    TemplateRenderer, 
    VariableProvider, 
    IncludeResolver,
    ContentRenderer,
    DocumentWatcher
} from './types';

let container: DIContainer;
let previewService: PreviewService;
let documentWatcher: VsCodeDocumentWatcher;

export function activate(context: vscode.ExtensionContext): void {
    try {
        container = new DIContainer();
        setupDependencies();

        previewService = container.get<PreviewService>('PreviewService');
        documentWatcher = container.get<VsCodeDocumentWatcher>('DocumentWatcher');

        const commandRegistry = new CommandRegistry();
        
        const showPreviewCommand = new ShowPreviewCommand(previewService);
        const showFullRenderCommand = new ShowFullRenderCommand(previewService);

        const disposables = [
            commandRegistry.register('sqlNunjucksPreview.showPreview', showPreviewCommand),
            commandRegistry.register('sqlNunjucksPreview.showFullRender', showFullRenderCommand)
        ];

        documentWatcher.watch((document) => {
            previewService.updatePreview(document);
        });

        context.subscriptions.push(...disposables, documentWatcher);

        vscode.window.showInformationMessage('SQL Nunjucks Preview расширение активировано!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        vscode.window.showErrorMessage(`Ошибка активации расширения: ${errorMessage}`);
    }
}

export function deactivate(): void {
    if (previewService) {
        previewService.dispose();
    }
    
    if (documentWatcher) {
        documentWatcher.dispose();
    }

    if (container) {
        container.clear();
    }
}

function setupDependencies(): void {
    container.registerFactory<FileSystemAdapter>('FileSystemAdapter', () => 
        new VsCodeFileSystemAdapter()
    );
    
    container.registerFactory<TemplateRenderer>('TemplateRenderer', () => 
        new NunjucksTemplateRenderer()
    );
    
    container.registerFactory<VariableProvider>('VariableProvider', () => 
        new VsCodeVariableProvider()
    );

    container.registerFactory<VsCodeDocumentWatcher>('DocumentWatcher', () => 
        new VsCodeDocumentWatcher()
    );

    container.registerFactory<IncludeResolver>('IncludeResolver', () => 
        new SqlIncludeResolver(container.get<FileSystemAdapter>('FileSystemAdapter'))
    );

    container.registerFactory<SqlProcessor>('SqlProcessor', () => 
        new SqlProcessor(
            container.get<IncludeResolver>('IncludeResolver'),
            container.get<TemplateRenderer>('TemplateRenderer')
        )
    );

    container.registerFactory<ContentRenderer>('ContentRenderer', () => 
        new HtmlContentRenderer()
    );

    container.registerFactory<VsCodeWebViewManager>('WebViewManager', () => 
        new VsCodeWebViewManager(
            new VsCodeWebViewFactory(),
            container.get<ContentRenderer>('ContentRenderer')
        )
    );

    container.registerFactory<PreviewService>('PreviewService', () => 
        new PreviewService(
            container.get<SqlProcessor>('SqlProcessor'),
            container.get<VsCodeWebViewManager>('WebViewManager'),
            container.get<VariableProvider>('VariableProvider')
        )
    );
}
