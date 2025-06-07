import { SqlDocument } from '@domain/entities/SqlDocument/types';

export interface SqlRenderStrategy {
  render(document: SqlDocument, variables?: Record<string, any>): RenderResult;
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