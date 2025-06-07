import { TemplateRenderer } from '@/domain/IncludeResolver/types';
import * as nunjucks from 'nunjucks';
import { injectable } from 'tsyringe';

@injectable()
export class NunjucksTemplateRenderer implements TemplateRenderer {
  private env: nunjucks.Environment;

  constructor() {
    this.env = new nunjucks.Environment();
  }

  public render(template: string, variables: Record<string, any>): string {
    try {
      const processedTemplate = this.unescapeQuotesInTemplate(template);
      
      return this.env.renderString(processedTemplate, variables);
    } catch (error) {
      throw new Error(
        `Template rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private unescapeQuotesInTemplate(template: string): string {
    return template
      .replace(/'\\'([^']*)\\''/g, "'$1'")
      .replace(/"\\"([^"]*)\\"/g, '"$1"');
  }
}
