import { SqlDocument } from '@domain/entities/SqlDocument/SqlDocument';
import { ProcessedSql } from '@domain/value-objects/ProcessedSql/ProcessedSql';
import { PreviewConfiguration } from '@domain/value-objects/PreviewConfiguration/PreviewConfiguration';
import { SqlFileIncludeService } from '@domain/services/SqlFileIncludeService/SqlFileIncludeService';
import { SqlTemplateRenderingService } from '@domain/services/SqlTemplateRenderingService/SqlTemplateRenderingService';
import {
  PreviewDisplayPort,
  TemplateVariableProvider,
} from '@application/SqlPreviewApplicationService/types';

export class SqlPreviewApplicationService {
  constructor(
    private readonly includeService: SqlFileIncludeService,
    private readonly templateService: SqlTemplateRenderingService,
    private readonly previewDisplay: PreviewDisplayPort,
    private readonly variableProvider: TemplateVariableProvider
  ) {}

  public async showIncludePreview(document: SqlDocument): Promise<void> {
    try {
      const config = PreviewConfiguration.includeExpansionOnly();
      this.previewDisplay.showPreview(document, config, ProcessedSql.fromContent(''));

      const processedSql = this.includeService.expandIncludes(document);
      this.previewDisplay.updatePreview(document, config, processedSql);
    } catch (error) {
      const config = PreviewConfiguration.includeExpansionOnly();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.previewDisplay.showError(document, config, errorMessage);
    }
  }

  public async showFullTemplatePreview(document: SqlDocument): Promise<void> {
    await this.showIncludePreview(document);

    const variables = await this.variableProvider.getVariables();
    if (!variables) {
      return;
    }

    try {
      this.templateService.validateVariables(variables);

      const config = PreviewConfiguration.fullTemplateRender(variables);
      this.previewDisplay.showPreview(document, config, ProcessedSql.fromContent(''));

      const withIncludes = this.includeService.expandIncludes(document);
      const fullyProcessed = this.templateService.renderTemplate(withIncludes, variables);

      this.previewDisplay.updatePreview(document, config, fullyProcessed);
    } catch (error) {
      const config = PreviewConfiguration.fullTemplateRender(variables);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.previewDisplay.showError(document, config, errorMessage);
    }
  }

  public updateExistingPreviews(document: SqlDocument): void {
    try {
      const includeConfig = PreviewConfiguration.includeExpansionOnly();
      const processedSql = this.includeService.expandIncludes(document);
      this.previewDisplay.updatePreview(document, includeConfig, processedSql);
    } catch (error) {
      const includeConfig = PreviewConfiguration.includeExpansionOnly();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.previewDisplay.showError(document, includeConfig, errorMessage);
    }
  }

  public dispose(): void {
    this.previewDisplay.dispose();
  }
}
