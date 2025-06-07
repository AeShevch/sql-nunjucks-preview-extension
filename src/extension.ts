import 'reflect-metadata';
import * as vscode from 'vscode';
import { container } from 'tsyringe';
import { SqlNunjucksPreviewExtension } from '@/SqlNunjucksPreviewExtension';

let extension: SqlNunjucksPreviewExtension;

export function activate(context: vscode.ExtensionContext): void {
  try {
    extension = container.resolve(SqlNunjucksPreviewExtension);
    extension.activate(context);
  } catch (error) {
    console.error('[Extension] Error during activation:', error);
    vscode.window.showErrorMessage(`Extension activation failed: ${error}`);
  }
}

export function deactivate(): void {
  if (extension) {
    extension.deactivate();
  }
}
