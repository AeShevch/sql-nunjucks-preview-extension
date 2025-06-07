import { SqlDocument } from '@domain/entities/types';

export interface SqlRenderStrategy {
  render(document: SqlDocument, variables?: Record<string, any>): RenderResult;
}

export interface IncludeResolver {
  resolve(filePath: string, content: string): string;
}

export interface TemplateRenderer {
  render(template: string, variables: Record<string, any>): string;
}

export enum RenderStrategy {
  INCLUDE_ONLY = 'include-only',
  FULL_RENDER = 'full-render',
}

export interface RenderResult {
  content: string;
  variables?: Record<string, any>;
  error?: string;
} 