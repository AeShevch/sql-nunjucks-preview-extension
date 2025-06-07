import * as path from 'path';
import { IncludeResolver, FileSystemAdapter } from '../types';

export class SqlIncludeResolver implements IncludeResolver {
    constructor(private fileSystem: FileSystemAdapter) {}

    resolve(filePath: string, content: string): string {
        const workspaceRoot = this.fileSystem.getWorkspaceRoot();
        return this.processIncludesRecursive(content, workspaceRoot, new Set());
    }

    private processIncludesRecursive(content: string, workspaceRoot: string, processedFiles: Set<string>): string {
        const includeRegex = /{%\s*include\s+['"]([^'"]+)['"]\s*%}/g;

        return content.replace(includeRegex, (match, includePath) => {
            const fullIncludePath = this.resolveIncludePath(includePath, workspaceRoot);

            if (processedFiles.has(fullIncludePath)) {
                return `/* ЦИКЛИЧЕСКОЕ ВКЛЮЧЕНИЕ: ${includePath} */`;
            }

            try {
                if (!this.fileSystem.exists(fullIncludePath)) {
                    return `/* ФАЙЛ НЕ НАЙДЕН: ${includePath} (искали в ${fullIncludePath}) */`;
                }

                const includeContent = this.fileSystem.readFile(fullIncludePath);
                processedFiles.add(fullIncludePath);

                const processedInclude = this.processIncludesRecursive(
                    includeContent,
                    workspaceRoot,
                    new Set(processedFiles)
                );

                processedFiles.delete(fullIncludePath);

                return `\n/* === ВКЛЮЧЕНО ИЗ: ${includePath} === */\n${processedInclude}\n/* === КОНЕЦ ВКЛЮЧЕНИЯ: ${includePath} === */\n`;
            } catch (error) {
                return `/* ОШИБКА ВКЛЮЧЕНИЯ: ${includePath} - ${error instanceof Error ? error.message : 'Неизвестная ошибка'} */`;
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
} 