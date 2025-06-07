import * as path from 'path';

export class SqlDocument {
    constructor(
        private readonly filePath: string,
        private readonly content: string
    ) {
        this.validateSqlFile();
    }

    get fileName(): string {
        return this.filePath;
    }

    get sqlContent(): string {
        return this.content;
    }

    get baseName(): string {
        return path.basename(this.filePath);
    }

    get isValid(): boolean {
        return this.content.trim().length > 0;
    }

    hasIncludes(): boolean {
        return /{%\s*include\s+['"]([^'"]+)['"]\s*%}/g.test(this.content);
    }

    hasTemplateVariables(): boolean {
        return /{{\s*[^}]+\s*}}/g.test(this.content);
    }

    private validateSqlFile(): void {
        if (!this.filePath.endsWith('.sql')) {
            throw new Error('Файл должен иметь расширение .sql');
        }
        
        if (!this.content) {
            throw new Error('Содержимое SQL файла не может быть пустым');
        }
    }

    static create(filePath: string, content: string): SqlDocument {
        return new SqlDocument(filePath, content);
    }
} 