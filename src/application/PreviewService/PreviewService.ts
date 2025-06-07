import { SqlDocument } from '@domain/entities/SqlDocument/types';
import { PreviewOptions } from '@presentation/WebViewManager/types';
import { RenderStrategy } from '@domain/SqlProcessor/types';
import { SqlProcessor } from '@domain/SqlProcessor/SqlProcessor';
import { VsCodeWebViewManager } from '@presentation/WebViewManager/WebViewManager';
import { inject, singleton } from 'tsyringe';
import { VsCodeVariableProvider } from '@infrastructure/VsCodeVariableProvider/VsCodeVariableProvider';
import { NunjucksVariableParser } from '@domain/services/NunjucksVariableParser/NunjucksVariableParser';

@singleton()
export class PreviewService {
  constructor(
    @inject(SqlProcessor) private sqlProcessor: SqlProcessor,
    @inject(VsCodeWebViewManager) private webViewManager: VsCodeWebViewManager,
    @inject(VsCodeVariableProvider) private variableProvider: VsCodeVariableProvider,
    @inject(NunjucksVariableParser) private variableParser: NunjucksVariableParser
  ) {
    this.webViewManager.setVariablesChangedCallback((document, variables) => {
      this.updateFullRenderWithVariables(document, variables);
    });
  }

  public async showPreview(document: SqlDocument): Promise<void> {
    const options: PreviewOptions = { isFullRender: false };

    this.webViewManager.showPreview(document, options);

    const result = this.sqlProcessor.process(document, RenderStrategy.INCLUDE_ONLY);

    if (result.error) {
      this.webViewManager.updatePanelWithError(document, options, result.error);
    } else {
      this.webViewManager.updatePanelWithProcessedContent(document, options, result.content);
    }
  }

  public async showFullRender(document: SqlDocument): Promise<void> {
    const includeResult = this.sqlProcessor.process(document, RenderStrategy.INCLUDE_ONLY);
    
    if (includeResult.error) {
      const options: PreviewOptions = { isFullRender: true, variables: {} };
      this.webViewManager.showPreview(document, options);
      this.webViewManager.updatePanelWithError(document, options, includeResult.error);
      return;
    }

    const extractedVariables = this.variableParser.extractVariables(includeResult.content);

    const options: PreviewOptions = {
      isFullRender: true,
      variables: extractedVariables,
    };

    this.webViewManager.showPreview(document, options);

    this.webViewManager.updatePanelWithProcessedContent(document, options, includeResult.content);
  }

  private updateFullRenderWithVariables(document: SqlDocument, variables: Record<string, any>): void {
    const options: PreviewOptions = {
      isFullRender: true,
      variables,
    };

    const result = this.sqlProcessor.process(document, RenderStrategy.FULL_RENDER, variables);

    if (result.error) {
      this.webViewManager.updatePanelWithError(document, options, result.error);
    } else {
      this.webViewManager.updatePanelWithProcessedContent(document, options, result.content);
    }
  }

  public updatePreview(document: SqlDocument): void {
    const simpleOptions: PreviewOptions = { isFullRender: false };
    const simpleResult = this.sqlProcessor.process(document, RenderStrategy.INCLUDE_ONLY);

    if (simpleResult.error) {
      this.webViewManager.updatePanelWithError(document, simpleOptions, simpleResult.error);
    } else {
      this.webViewManager.updatePanelWithProcessedContent(
        document,
        simpleOptions,
        simpleResult.content
      );
    }
  }

  public dispose(): void {
    this.webViewManager.dispose();
  }
}
