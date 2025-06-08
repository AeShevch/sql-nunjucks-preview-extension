export interface SqlFileRepository {
  readFile(filePath: string): string;
  exists(filePath: string): boolean;
  getWorkspaceRoot(): string;
}
