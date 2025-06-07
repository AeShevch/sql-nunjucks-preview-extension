import * as fs from 'fs';
import * as vscode from 'vscode';
import { SqlFileRepository } from '@domain/services/SqlFileIncludeService';

export class VsCodeSqlFileRepository implements SqlFileRepository {
    public readFile(filePath: string): string {
        return fs.readFileSync(filePath, 'utf8');
    }

    public exists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    public getWorkspaceRoot(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return workspaceFolders?.[0]?.uri.fsPath || '';
    }
} 