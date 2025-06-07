import * as nunjucks from 'nunjucks';
import { TemplateRenderer } from '../types';

export class NunjucksTemplateRenderer implements TemplateRenderer {
    private env: nunjucks.Environment;

    constructor() {
        this.env = new nunjucks.Environment();
    }

    render(template: string, variables: Record<string, any>): string {
        try {
            return this.env.renderString(template, variables);
        } catch (error) {
            throw new Error(`Ошибка рендеринга шаблона: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }
} 