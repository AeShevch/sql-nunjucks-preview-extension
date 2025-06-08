export interface IncludeResolver {
  resolve(filePath: string, content: string): string;
}

export interface TemplateRenderer {
  render(template: string, variables: Record<string, any>): string;
}
