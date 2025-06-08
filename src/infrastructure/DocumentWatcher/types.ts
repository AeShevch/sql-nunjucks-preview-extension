import { SqlDocument } from '@domain/entities/SqlDocument/types';

export interface DocumentWatcher {
  watch(callback: (document: SqlDocument) => void): void;
  dispose(): void;
}
