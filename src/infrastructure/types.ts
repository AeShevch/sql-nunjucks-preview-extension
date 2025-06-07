import { SqlDocument } from '@domain/entities/types';

export interface FileSystemAdapter {
  readFile(path: string): string;
  exists(path: string): boolean;
  getWorkspaceRoot(): string;
}

export interface VariableProvider {
  getVariables(): Promise<Record<string, any> | undefined>;
}

export interface DocumentWatcher {
  watch(callback: (document: SqlDocument) => void): void;
  dispose(): void;
} 