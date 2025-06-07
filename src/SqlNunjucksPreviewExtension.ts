import * as vscode from "vscode";

import { DIContainer } from "./container/DIContainer";
import { PreviewService } from "./application/PreviewService";
import { VsCodeDocumentWatcher } from "./infrastructure/DocumentWatcher";
import { CommandRegistry } from "./commands/PreviewCommands";
import { ShowPreviewCommand, ShowFullRenderCommand } from "./commands/PreviewCommands";
import { FileSystemAdapter } from "./types";
import { VsCodeFileSystemAdapter } from "./infrastructure/FileSystemAdapter";
import { TemplateRenderer } from "./types";
import { NunjucksTemplateRenderer } from "./infrastructure/NunjucksAdapter";
import { VariableProvider } from "./types";
import { VsCodeVariableProvider } from "./infrastructure/VsCodeVariableProvider";
import { IncludeResolver } from "./types";
import { SqlIncludeResolver } from "./domain/IncludeResolver";
import { SqlProcessor } from "./domain/SqlProcessor";
import { ContentRenderer } from "./types";
import { HtmlContentRenderer } from "./presentation/ContentRenderer";
import { VsCodeWebViewManager, VsCodeWebViewFactory } from "./presentation/WebViewManager";

export class SqlNunjucksPreviewExtension {
    private container: DIContainer;
    private previewService: PreviewService;
    private documentWatcher: VsCodeDocumentWatcher;
  
    constructor() {
      this.container = new DIContainer();
  
      this.setupDependencies();
      
      this.previewService = this.container.get<PreviewService>("PreviewService");
      this.documentWatcher =
        this.container.get<VsCodeDocumentWatcher>("DocumentWatcher");
  
    }
  
    public activate(context: vscode.ExtensionContext): void {
      try {
        const commandRegistry = new CommandRegistry();
  
        const showPreviewCommand = new ShowPreviewCommand(this.previewService);
        const showFullRenderCommand = new ShowFullRenderCommand(
          this.previewService
        );
  
        const disposables = [
          commandRegistry.register(
            "sqlNunjucksPreview.showPreview",
            showPreviewCommand
          ),
          commandRegistry.register(
            "sqlNunjucksPreview.showFullRender",
            showFullRenderCommand
          ),
        ];
  
        this.documentWatcher.watch((document) => {
          this.previewService.updatePreview(document);
        });
  
        context.subscriptions.push(...disposables, this.documentWatcher);
  
        vscode.window.showInformationMessage("SQL Nunjucks Preview расширение активировано!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Неизвестная ошибка";
        vscode.window.showErrorMessage(
          `Ошибка активации расширения: ${errorMessage}`
        );
      }
    }
  
    public deactivate(): void {
      if (this.previewService) {
        this.previewService.dispose();
      }
  
      if (this.documentWatcher) {
        this.documentWatcher.dispose();
      }
  
      if (this.container) {
        this.container.clear();
      }
    }
  
    private setupDependencies(): void {
      this.container.registerFactory<FileSystemAdapter>(
        "FileSystemAdapter",
        () => new VsCodeFileSystemAdapter()
      );
  
      this.container.registerFactory<TemplateRenderer>(
        "TemplateRenderer",
        () => new NunjucksTemplateRenderer()
      );
  
      this.container.registerFactory<VariableProvider>(
        "VariableProvider",
        () => new VsCodeVariableProvider()
      );
  
      this.container.registerFactory<VsCodeDocumentWatcher>(
        "DocumentWatcher",
        () => new VsCodeDocumentWatcher()
      );
  
      this.container.registerFactory<IncludeResolver>(
        "IncludeResolver",
        () =>
          new SqlIncludeResolver(
            this.container.get<FileSystemAdapter>("FileSystemAdapter")
          )
      );
  
      this.container.registerFactory<SqlProcessor>(
        "SqlProcessor",
        () =>
          new SqlProcessor(
            this.container.get<IncludeResolver>("IncludeResolver"),
            this.container.get<TemplateRenderer>("TemplateRenderer")
          )
      );
  
      this.container.registerFactory<ContentRenderer>(
        "ContentRenderer",
        () => new HtmlContentRenderer()
      );
  
      this.container.registerFactory<VsCodeWebViewManager>(
        "WebViewManager",
        () =>
          new VsCodeWebViewManager(
            new VsCodeWebViewFactory(),
            this.container.get<ContentRenderer>("ContentRenderer")
          )
      );
  
      this.container.registerFactory<PreviewService>(
        "PreviewService",
        () =>
          new PreviewService(
            this.container.get<SqlProcessor>("SqlProcessor"),
            this.container.get<VsCodeWebViewManager>("WebViewManager"),
            this.container.get<VariableProvider>("VariableProvider")
          )
      );
    }
  }