import { SqlDocument } from '@domain/entities/types';
import { PreviewOptions } from '@presentation/types';
import { RenderStrategy } from '@domain/types';
import { SqlProcessor } from '@domain/SqlProcessor';
import { VsCodeWebViewManager } from '@presentation/WebViewManager';
import { inject, singleton } from 'tsyringe';
import { VsCodeVariableProvider } from '@infrastructure/VsCodeVariableProvider';

@singleton()
export class PreviewService {
  constructor(
    @inject(SqlProcessor) private sqlProcessor: SqlProcessor,
    @inject(VsCodeWebViewManager) private webViewManager: VsCodeWebViewManager,
    @inject(VsCodeVariableProvider) private variableProvider: VsCodeVariableProvider
  ) {}

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
    await this.showPreview(document);

    const variables = await this.variableProvider.getVariables();
    if (!variables) {
      return;
    }

    const options: PreviewOptions = {
      isFullRender: true,
      variables,
    };

    this.webViewManager.showPreview(document, options);

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
