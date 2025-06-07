import "reflect-metadata";
import * as vscode from 'vscode';
import { container } from 'tsyringe';
import { SqlNunjucksPreviewExtension } from './SqlNunjucksPreviewExtension';

const extension = container.resolve(SqlNunjucksPreviewExtension);

export function activate(context: vscode.ExtensionContext): void {
    extension.activate(context);
}

export function deactivate(): void {
    extension.deactivate();
}
