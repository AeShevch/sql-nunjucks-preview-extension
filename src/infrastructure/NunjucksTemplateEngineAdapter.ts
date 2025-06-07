import * as nunjucks from 'nunjucks';
import { TemplateEngine } from '../domain/services/SqlTemplateRenderingService';

export class NunjucksTemplateEngine implements TemplateEngine {
    private env: nunjucks.Environment;

    constructor() {
        this.env = new nunjucks.Environment();
    }

    render(template: string, variables: Record<string, any>): string {
        return this.env.renderString(template, variables);
    }
} 