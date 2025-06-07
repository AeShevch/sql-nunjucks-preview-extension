import { ProcessedSql } from '@domain/value-objects/ProcessedSql/ProcessedSql';
import { TemplateEngine } from '@domain/services/SqlTemplateRenderingService/types';

export class SqlTemplateRenderingService {
  constructor(private readonly templateEngine: TemplateEngine) {}

  public renderTemplate(processedSql: ProcessedSql, variables: Record<string, any>): ProcessedSql {
    try {
      const renderedContent = this.templateEngine.render(processedSql.sqlContent, variables);

      return ProcessedSql.fromTemplateRender(
        renderedContent,
        variables
      ).withAdditionalProcessingStep('template-rendered');
    } catch (error) {
      throw new Error(
        `Template rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public validateVariables(variables: Record<string, any>): void {
    if (!variables || Object.keys(variables).length === 0) {
      throw new Error('Template variables cannot be empty');
    }

    try {
      JSON.stringify(variables);
    } catch (error) {
      throw new Error('Variables must be JSON serializable');
    }
  }
}
