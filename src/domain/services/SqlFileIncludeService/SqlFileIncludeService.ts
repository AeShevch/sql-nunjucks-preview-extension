import * as path from 'path';
import { SqlDocument } from '@domain/entities/SqlDocument/SqlDocument';
import { ProcessedSql } from '@domain/value-objects/ProcessedSql/ProcessedSql';
import { SqlFileRepository } from '@domain/services/SqlFileIncludeService/types';

export class SqlFileIncludeService {
  constructor(private readonly fileRepository: SqlFileRepository) {}

  public expandIncludes(document: SqlDocument): ProcessedSql {
    if (!document.hasIncludes()) {
      return ProcessedSql.fromContent(document.sqlContent);
    }

    const workspaceRoot = this.fileRepository.getWorkspaceRoot();
    const expandedContent = this.processIncludesRecursive(
      document.sqlContent,
      workspaceRoot,
      new Set()
    );

    return ProcessedSql.fromContent(expandedContent).withAdditionalProcessingStep(
      'includes-expanded'
    );
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
        return this.createIncludeComment('CIRCULAR INCLUDE', includePath);
      }

      try {
        if (!this.fileRepository.exists(fullIncludePath)) {
          return this.createIncludeComment('FILE NOT FOUND', includePath, fullIncludePath);
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return this.createIncludeComment('INCLUDE ERROR', includePath, errorMessage);
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
    return `\n/* === INCLUDED FROM: ${includePath} === */\n${content}\n/* === END INCLUDE: ${includePath} === */\n`;
  }
}
