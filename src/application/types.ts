import { SqlDocument } from '@domain/entities/SqlDocument';
import { ProcessedSql } from '@domain/value-objects/ProcessedSql';
import { PreviewConfiguration } from '@domain/value-objects/PreviewConfiguration';

export interface PreviewDisplayPort {
  showPreview(
    document: SqlDocument,
    config: PreviewConfiguration,
    processedSql: ProcessedSql
  ): void;
  updatePreview(
    document: SqlDocument,
    config: PreviewConfiguration,
    processedSql: ProcessedSql
  ): void;
  showError(document: SqlDocument, config: PreviewConfiguration, error: string): void;
  dispose(): void;
}

export interface TemplateVariableProvider {
  getVariables(): Promise<Record<string, any> | undefined>;
} 