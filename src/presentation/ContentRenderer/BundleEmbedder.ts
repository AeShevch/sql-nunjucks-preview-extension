import * as fs from 'fs';
import * as path from 'path';

export class BundleEmbedder {
  private static bundleCache: string | null = null;

  public static getBundleSize(): number {
    return this.bundleCache ? this.bundleCache.length : 0;
  }

  public static getReactBundle(): string {
    if (this.bundleCache) {
      return this.bundleCache;
    }

    try {
      const bundlePath = path.join(__dirname, 'react-bundle.js');
      
      if (fs.existsSync(bundlePath)) {
        this.bundleCache = fs.readFileSync(bundlePath, 'utf8');
        return this.bundleCache;
      }
    } catch (error) {
      // Silent fallback
    }

    return this.getFallbackBundle();
  }

  private static getFallbackBundle(): string {
    return `
      // Fallback implementation
      window.renderSqlPreview = function(props) {
        const container = document.getElementById('react-root');
        if (!container) return;
        
        if (props.type === 'error') {
          container.innerHTML = \`
            <div style="
              background-color: var(--vscode-inputValidation-errorBackground);
              border: 1px solid var(--vscode-inputValidation-errorBorder);
              border-radius: 4px;
              padding: 15px;
              color: var(--vscode-inputValidation-errorForeground);
            ">
              <h2>❌ SQL Processing Error</h2>
              <p>\${props.data.error}</p>
            </div>
          \`;
        } else {
          const data = props.data;
          const variablesHtml = data.variables ? \`
            <div style="
              background-color: var(--vscode-textBlockQuote-background);
              border: 1px solid var(--vscode-textBlockQuote-border);
              border-radius: 4px;
              padding: 15px;
              margin-bottom: 20px;
            ">
              <h3 style="margin-top: 0; color: var(--vscode-textPreformat-foreground);">Template Variables:</h3>
              <pre style="
                background-color: var(--vscode-textCodeBlock-background);
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
                margin: 0;
              "><code>\${JSON.stringify(data.variables, null, 2)}</code></pre>
            </div>
          \` : '';
          
          container.innerHTML = \`
            <div style="
              font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
              line-height: 1.6;
              color: var(--vscode-editor-foreground);
            ">
              <div style="
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 10px;
                margin-bottom: 20px;
              ">
                <h1 style="color: var(--vscode-textPreformat-foreground); margin-top: 0;">
                  \${data.isFullRender ? '🔧 SQL Full Render' : '📋 SQL Preview'} - \${data.fileName}
                </h1>
                <p style="margin: 0; color: var(--vscode-descriptionForeground);">
                  \${data.isFullRender ? 'Fully processed SQL with substituted variables' : 'SQL with expanded includes'}
                </p>
              </div>
              \${variablesHtml}
              <div style="
                background-color: var(--vscode-textCodeBlock-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 15px;
                white-space: pre-wrap;
                font-size: 14px;
                overflow-x: auto;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
              ">\${data.sql}</div>
            </div>
          \`;
        }
      };
    `;
  }

  public static clearCache(): void {
    this.bundleCache = null;
  }
} 