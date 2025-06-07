import * as path from 'path';
import { SqlDocument } from '../entities/SqlDocument';
import { ProcessedSql } from '../value-objects/ProcessedSql';

export interface SqlFileRepository {
    readFile(filePath: string): string;
    exists(filePath: string): boolean;
    getWorkspaceRoot(): string;
}

export class SqlFileIncludeService {
    constructor(private readonly fileRepository: SqlFileRepository) {}

    expandIncludes(sqlDocument: SqlDocument): ProcessedSql {
        if (!sqlDocument.hasIncludes()) {
            return ProcessedSql.fromContent(sqlDocument.sqlContent);
        }

        const workspaceRoot = this.fileRepository.getWorkspaceRoot();
        const expandedContent = this.processIncludesRecursive(
            sqlDocument.sqlContent, 
            workspaceRoot, 
            new Set()
        );

        return ProcessedSql.fromContent(expandedContent)
            .withAdditionalProcessingStep('includes-expanded');
    }

    private processIncludesRecursive(
        content: string, 
        workspaceRoot: string, 
        processedFiles: Set<string>
    ): string {
        const includeRegex = /{%\s*include\s+['"]([^'"]+)['"]\s*%}/g;

        return content.replace(includeRegex, (match, includePath) => {
            const fullIncludePath = this.resolveIncludePath(includePath, workspaceRoot);

            if (processedFiles.has(fullIncludePath)) {
                return this.createIncludeComment('ЦИКЛИЧЕСКОЕ ВКЛЮЧЕНИЕ', includePath);
            }

            try {
                if (!this.fileRepository.exists(fullIncludePath)) {
                    return this.createIncludeComment('ФАЙЛ НЕ НАЙДЕН', includePath, fullIncludePath);
                }

                const includeContent = this.fileRepository.readFile(fullIncludePath);
                processedFiles.add(fullIncludePath);

                const processedInclude = this.processIncludesRecursive(
                    includeContent,
                    workspaceRoot,
                    new Set(processedFiles)
                );

                processedFiles.delete(fullIncludePath);

                return this.wrapIncludeContent(includePath, processedInclude);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
                return this.createIncludeComment('ОШИБКА ВКЛЮЧЕНИЯ', includePath, errorMessage);
            }
        });
    }

    private resolveIncludePath(includePath: string, workspaceRoot: string): string {
        const sqlsBaseDir = path.join(workspaceRoot, 'clickhouse', 'sqls');

        if (includePath.startsWith('/')) {
            return path.join(sqlsBaseDir, includePath.substring(1));
        } else {
            return path.join(sqlsBaseDir, includePath);
        }
    }

    private createIncludeComment(type: string, includePath: string, details?: string): string {
        const detailsText = details ? ` (${details})` : '';
        return `/* ${type}: ${includePath}${detailsText} */`;
    }

    private wrapIncludeContent(includePath: string, content: string): string {
        return `\n/* === ВКЛЮЧЕНО ИЗ: ${includePath} === */\n${content}\n/* === КОНЕЦ ВКЛЮЧЕНИЯ: ${includePath} === */\n`;
    }
} 