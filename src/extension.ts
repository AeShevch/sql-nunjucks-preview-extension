import * as vscode from "vscode";
import { SqlNunjucksPreviewExtension } from "./SqlNunjucksPreviewExtension";

const extension = new SqlNunjucksPreviewExtension();

export function activate(context: vscode.ExtensionContext): void {
  extension.activate(context);
}

export function deactivate(): void {
  extension.deactivate();
}
