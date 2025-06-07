import * as vscode from 'vscode';
import { TemplateVariableProvider } from '@application/SqlPreviewApplicationService';

export class VsCodeTemplateVariableProvider implements TemplateVariableProvider {
    public async getVariables(): Promise<Record<string, any> | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Enter template variables in JSON format',
            placeHolder: '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
            value: '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
        });

        if (!input) {
            return undefined;
        }

        try {
            return JSON.parse(input);
        } catch (error) {
            vscode.window.showErrorMessage('Invalid JSON format');
            return undefined;
        }
    }
} 