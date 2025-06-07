import * as fs from 'fs';
import * as vscode from 'vscode';
import { FileSystemAdapter } from '../types';
import { injectable } from 'tsyringe';

@injectable()
export class VsCodeFileSystemAdapter implements FileSystemAdapter {
    readFile(path: string): string {
        return fs.readFileSync(path, 'utf8');
    }

    exists(path: string): boolean {
        return fs.existsSync(path);
    }

    getWorkspaceRoot(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return workspaceFolders?.[0]?.uri.fsPath || '';
    }
} 