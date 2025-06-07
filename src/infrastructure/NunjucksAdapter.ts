import * as nunjucks from 'nunjucks';
import { TemplateRenderer } from '@types';
import { injectable } from 'tsyringe';

@injectable()
export class NunjucksTemplateRenderer implements TemplateRenderer {
    private env: nunjucks.Environment;

    constructor() {
        this.env = new nunjucks.Environment();
    }

    public render(template: string, variables: Record<string, any>): string {
        try {
            return this.env.renderString(template, variables);
        } catch (error) {
            throw new Error(`Template rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 