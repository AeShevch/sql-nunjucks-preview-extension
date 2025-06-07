export interface FileSystemAdapter {
  readFile(path: string): string;
  exists(path: string): boolean;
  getWorkspaceRoot(): string;
} 