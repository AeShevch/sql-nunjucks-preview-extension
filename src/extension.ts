import "reflect-metadata";
import * as vscode from 'vscode';
import { container } from 'tsyringe';
import { SqlNunjucksPreviewExtension } from '@/SqlNunjucksPreviewExtension';

console.log('[Extension] Starting to load extension...');

let extension: SqlNunjucksPreviewExtension;

export function activate(context: vscode.ExtensionContext): void {
    console.log('[Extension] activate() function called');
    
    try {
        console.log('[Extension] Resolving SqlNunjucksPreviewExtension from container...');
        extension = container.resolve(SqlNunjucksPreviewExtension);
        console.log('[Extension] Extension resolved successfully');
        
        console.log('[Extension] Calling extension.activate()...');
        extension.activate(context);
        console.log('[Extension] Extension activated successfully');
    } catch (error) {
        console.error('[Extension] Error during activation:', error);
        vscode.window.showErrorMessage(`Extension activation failed: ${error}`);
    }
}

export function deactivate(): void {
    console.log('[Extension] deactivate() function called');
    if (extension) {
        extension.deactivate();
    }
}
