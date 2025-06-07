import * as path from 'path';

export class SqlDocument {
  constructor(
    private readonly filePath: string,
    private readonly content: string
  ) {
    this.validateSqlFile();
  }

  public get fileName(): string {
    return this.filePath;
  }

  public get sqlContent(): string {
    return this.content;
  }

  public get baseName(): string {
    return path.basename(this.filePath);
  }

  public get isValid(): boolean {
    return this.content.trim().length > 0;
  }

  public hasIncludes(): boolean {
    return /{%\s*include\s+['"]([^'"]+)['"]\s*%}/g.test(this.content);
  }

  public hasTemplateVariables(): boolean {
    return /{{\s*[^}]+\s*}}/g.test(this.content);
  }

  private validateSqlFile(): void {
    if (!this.filePath.endsWith('.sql')) {
      throw new Error('File must have .sql extension');
    }

    if (!this.content) {
      throw new Error('SQL file content cannot be empty');
    }
  }

  public static create(filePath: string, content: string): SqlDocument {
    return new SqlDocument(filePath, content);
  }
}
