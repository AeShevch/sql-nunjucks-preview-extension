import { SqlDocument } from '@domain/entities/SqlDocument';
import { ProcessedSql } from '@domain/value-objects/ProcessedSql';
import { PreviewConfiguration, PreviewType } from '@domain/value-objects/PreviewConfiguration';
import { SqlFileIncludeService } from '@domain/services/SqlFileIncludeService';
import { SqlTemplateRenderingService } from '@domain/services/SqlTemplateRenderingService';

export interface PreviewDisplayPort {
    showPreview(document: SqlDocument, config: PreviewConfiguration, processedSql: ProcessedSql): void;
    updatePreview(document: SqlDocument, config: PreviewConfiguration, processedSql: ProcessedSql): void;
    showError(document: SqlDocument, config: PreviewConfiguration, error: string): void;
    dispose(): void;
}

export interface TemplateVariableProvider {
    getVariables(): Promise<Record<string, any> | undefined>;
}

export class SqlPreviewApplicationService {
    constructor(
        private readonly includeService: SqlFileIncludeService,
        private readonly templateService: SqlTemplateRenderingService,
        private readonly previewDisplay: PreviewDisplayPort,
        private readonly variableProvider: TemplateVariableProvider
    ) {}

    async showIncludePreview(document: SqlDocument): Promise<void> {
        try {
            const config = PreviewConfiguration.includeExpansionOnly();
            this.previewDisplay.showPreview(document, config, ProcessedSql.fromContent(''));
            
            const processedSql = this.includeService.expandIncludes(document);
            this.previewDisplay.updatePreview(document, config, processedSql);
        } catch (error) {
            const config = PreviewConfiguration.includeExpansionOnly();
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            this.previewDisplay.showError(document, config, errorMessage);
        }
    }

    async showFullTemplatePreview(document: SqlDocument): Promise<void> {
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
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            this.previewDisplay.showError(document, config, errorMessage);
        }
    }

    updateExistingPreviews(document: SqlDocument): void {
        try {
            const includeConfig = PreviewConfiguration.includeExpansionOnly();
            const processedSql = this.includeService.expandIncludes(document);
            this.previewDisplay.updatePreview(document, includeConfig, processedSql);
        } catch (error) {
            const includeConfig = PreviewConfiguration.includeExpansionOnly();
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            this.previewDisplay.showError(document, includeConfig, errorMessage);
        }
    }

    dispose(): void {
        this.previewDisplay.dispose();
    }
} 