import { ContentRenderer } from '@presentation/ContentRenderer/types';
import { PreviewOptions } from '@presentation/WebViewManager/types';
import { BundleEmbedder } from '@presentation/ContentRenderer/BundleEmbedder';
import { singleton } from 'tsyringe';

@singleton()
export class ReactContentRenderer implements ContentRenderer {
  public renderPreview(sql: string, fileName: string, options: PreviewOptions): string {
    const reactProps = {
      type: 'preview' as const,
      data: {
        fileName,
        sql,
        isFullRender: options.isFullRender,
        variables: options.variables,
      },
    };

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${options.isFullRender ? 'SQL Full Render' : 'SQL Preview'} - ${fileName}</title>
        </head>
                 <body>
             <div id="react-root"></div>
             <script>
                 ${BundleEmbedder.getReactBundle()}
                 window.renderSqlPreview(${JSON.stringify(reactProps)});
             </script>
         </body>
        </html>
    `;
  }

  public renderError(error: string): string {
    const errorProps = {
      type: 'error' as const,
      data: {
        error,
      },
    };

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error</title>
        </head>
                 <body>
             <div id="react-root"></div>
             <script>
                 ${BundleEmbedder.getReactBundle()}
                 window.renderSqlPreview(${JSON.stringify(errorProps)});
             </script>
         </body>
        </html>
    `;
  }


} 