import * as vscode from 'vscode';
import { VariableProvider } from '@infrastructure/VsCodeVariableProvider/types';
import { injectable } from 'tsyringe';

@injectable()
export class VsCodeVariableProvider implements VariableProvider {
  public async getVariables(): Promise<Record<string, any> | undefined> {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter template variables in JSON format',
      placeHolder:
        '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
      value:
        '{"companyCurrency": "USD", "startTime": "2024-01-01", "endTime": "2024-12-31", "timezone": "UTC", "dataPoint": "charge"}',
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
