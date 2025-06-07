import { ProcessedSql } from '../value-objects/ProcessedSql';

export interface TemplateEngine {
    render(template: string, variables: Record<string, any>): string;
}

export class SqlTemplateRenderingService {
    constructor(private readonly templateEngine: TemplateEngine) {}

    renderTemplate(processedSql: ProcessedSql, variables: Record<string, any>): ProcessedSql {
        try {
            const renderedContent = this.templateEngine.render(
                processedSql.sqlContent, 
                variables
            );

            return ProcessedSql.fromTemplateRender(renderedContent, variables)
                .withAdditionalProcessingStep('template-rendered');
        } catch (error) {
            throw new Error(`Ошибка рендеринга шаблона: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }

    validateVariables(variables: Record<string, any>): void {
        if (!variables || Object.keys(variables).length === 0) {
            throw new Error('Переменные для рендеринга не могут быть пустыми');
        }

        try {
            JSON.stringify(variables);
        } catch (error) {
            throw new Error('Переменные должны быть сериализуемыми в JSON');
        }
    }
} 