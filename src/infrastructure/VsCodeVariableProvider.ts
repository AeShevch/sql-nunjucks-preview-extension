import * as vscode from 'vscode';
import { VariableProvider } from '../types';

export class VsCodeVariableProvider implements VariableProvider {
    async getVariables(): Promise<Record<string, any> | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Введите переменные для рендеринга в формате JSON',
            placeHolder: '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
            value: '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
        });

        if (!input) {
            return undefined;
        }

        try {
            return JSON.parse(input);
        } catch (error) {
            vscode.window.showErrorMessage('Неверный формат JSON');
            return undefined;
        }
    }
} 