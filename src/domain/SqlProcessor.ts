import { SqlDocument, RenderResult, RenderStrategy, IncludeResolver, TemplateRenderer } from '../types';

export interface SqlRenderStrategy {
    render(document: SqlDocument, variables?: Record<string, any>): RenderResult;
}

export class IncludeOnlyStrategy implements SqlRenderStrategy {
    constructor(private includeResolver: IncludeResolver) {}

    render(document: SqlDocument): RenderResult {
        try {
            const content = this.includeResolver.resolve(document.fileName, document.content);
            return { content };
        } catch (error) {
            return { 
                content: '', 
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    }
}

export class FullRenderStrategy implements SqlRenderStrategy {
    constructor(
        private includeResolver: IncludeResolver,
        private templateRenderer: TemplateRenderer
    ) {}

    render(document: SqlDocument, variables: Record<string, any> = {}): RenderResult {
        try {
            const processedSql = this.includeResolver.resolve(document.fileName, document.content);
            const renderedSql = this.templateRenderer.render(processedSql, variables);
            return { content: renderedSql, variables };
        } catch (error) {
            return { 
                content: '', 
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    }
}

export class SqlProcessor {
    private strategies: Map<RenderStrategy, SqlRenderStrategy> = new Map();

    constructor(
        includeResolver: IncludeResolver,
        templateRenderer: TemplateRenderer
    ) {
        this.strategies.set(RenderStrategy.INCLUDE_ONLY, new IncludeOnlyStrategy(includeResolver));
        this.strategies.set(RenderStrategy.FULL_RENDER, new FullRenderStrategy(includeResolver, templateRenderer));
    }

    process(document: SqlDocument, strategy: RenderStrategy, variables?: Record<string, any>): RenderResult {
        const renderStrategy = this.strategies.get(strategy);
        if (!renderStrategy) {
            return { content: '', error: `Неизвестная стратегия рендеринга: ${strategy}` };
        }

        return renderStrategy.render(document, variables);
    }
} 