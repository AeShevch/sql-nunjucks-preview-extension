export interface SqlFileRepository {
  readFile(filePath: string): string;
  exists(filePath: string): boolean;
  getWorkspaceRoot(): string;
}

export interface TemplateEngine {
  render(template: string, variables: Record<string, any>): string;
} 