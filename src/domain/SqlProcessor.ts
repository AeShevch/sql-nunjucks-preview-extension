import { NunjucksTemplateRenderer } from '@infrastructure/NunjucksAdapter';
import {
  SqlRenderStrategy,
  RenderResult,
  RenderStrategy,
  IncludeResolver,
  TemplateRenderer,
} from '@domain/types';
import { SqlDocument } from '@domain/entities/types';
import { injectable, inject } from 'tsyringe';
import { SqlIncludeResolver } from '@domain/IncludeResolver';

export class IncludeOnlyStrategy implements SqlRenderStrategy {
  constructor(private includeResolver: IncludeResolver) {}

  public render(document: SqlDocument): RenderResult {
    try {
      const content = this.includeResolver.resolve(document.fileName, document.content);
      return { content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class FullRenderStrategy implements SqlRenderStrategy {
  constructor(
    private includeResolver: IncludeResolver,
    private templateRenderer: TemplateRenderer
  ) {}

  public render(document: SqlDocument, variables: Record<string, any> = {}): RenderResult {
    try {
      const processedSql = this.includeResolver.resolve(document.fileName, document.content);
      const renderedSql = this.templateRenderer.render(processedSql, variables);
      return { content: renderedSql, variables };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

@injectable()
export class SqlProcessor {
  private strategies: Map<RenderStrategy, SqlRenderStrategy> = new Map();

  constructor(
    @inject(SqlIncludeResolver) includeResolver: SqlIncludeResolver,
    @inject(NunjucksTemplateRenderer) templateRenderer: NunjucksTemplateRenderer
  ) {
    this.strategies.set(RenderStrategy.INCLUDE_ONLY, new IncludeOnlyStrategy(includeResolver));
    this.strategies.set(
      RenderStrategy.FULL_RENDER,
      new FullRenderStrategy(includeResolver, templateRenderer)
    );
  }

  public process(
    document: SqlDocument,
    strategy: RenderStrategy,
    variables?: Record<string, any>
  ): RenderResult {
    const renderStrategy = this.strategies.get(strategy);
    if (!renderStrategy) {
      return { content: '', error: `Unknown render strategy: ${strategy}` };
    }

    return renderStrategy.render(document, variables);
  }
}
