import * as path from 'path';
import { IncludeResolver } from '@domain/IncludeResolver/types';
import { FileSystemAdapter } from '@infrastructure/FileSystemAdapter/types';
import { injectable, inject } from 'tsyringe';
import { VsCodeFileSystemAdapter } from '@infrastructure/FileSystemAdapter/FileSystemAdapter';

@injectable()
export class SqlIncludeResolver implements IncludeResolver {
  constructor(@inject(VsCodeFileSystemAdapter) private fileSystem: VsCodeFileSystemAdapter) {}

  public resolve(fileName: string, content: string): string {
    const workspaceRoot = this.fileSystem.getWorkspaceRoot();
    return this.processIncludesRecursive(content, workspaceRoot, new Set());
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
        return `/* CIRCULAR INCLUDE: ${includePath} */`;
      }

      try {
        if (!this.fileSystem.exists(fullIncludePath)) {
          return `/* FILE NOT FOUND: ${includePath} (searched in ${fullIncludePath}) */`;
        }

        const includeContent = this.fileSystem.readFile(fullIncludePath);
        processedFiles.add(fullIncludePath);

        const processedInclude = this.processIncludesRecursive(
          includeContent,
          workspaceRoot,
          new Set(processedFiles)
        );

        processedFiles.delete(fullIncludePath);

        return `\n/* === INCLUDED FROM: ${includePath} === */\n${processedInclude}\n/* === END INCLUDE: ${includePath} === */\n`;
      } catch (error) {
        return `/* INCLUDE ERROR: ${includePath} - ${error instanceof Error ? error.message : 'Unknown error'} */`;
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
