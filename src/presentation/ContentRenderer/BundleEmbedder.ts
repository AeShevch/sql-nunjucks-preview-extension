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
    }

    return this.getFallbackBundle();
  }

  private static getFallbackBundle(): string {
    return `
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
          let isEditing = false;
          let currentVariables = data.variables || {};
          
          function renderVariablesSection() {
            if (!data.isFullRender) return '';
            
            return \`
              <div style="
                background-color: var(--vscode-textBlockQuote-background);
                border: 1px solid var(--vscode-textBlockQuote-border);
                border-radius: 4px;
                margin-bottom: 20px;
              ">
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 15px;
                  border-bottom: 1px solid var(--vscode-textBlockQuote-border);
                ">
                  <h3 style="margin: 0; color: var(--vscode-textPreformat-foreground);">Переменные шаблона</h3>
                  <button id="edit-variables-btn" style="
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                  ">Редактировать</button>
                </div>
                <div id="variables-content" style="padding: 15px;">
                  <pre style="
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    margin: 0;
                    border: 1px solid var(--vscode-panel-border);
                  "><code>\${JSON.stringify(currentVariables, null, 2)}</code></pre>
                </div>
              </div>
            \`;
          }
          
          function renderEditForm() {
            return \`
              <div style="padding: 15px;">
                <textarea id="variables-editor" style="
                  width: 100%;
                  min-height: 150px;
                  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                  font-size: 12px;
                  background: var(--vscode-input-background);
                  color: var(--vscode-input-foreground);
                  border: 1px solid var(--vscode-input-border);
                  border-radius: 4px;
                  padding: 10px;
                  resize: vertical;
                " placeholder='{"key": "value"}'>\${JSON.stringify(currentVariables, null, 2)}</textarea>
                <div id="error-message" style="
                  color: var(--vscode-inputValidation-errorForeground);
                  font-size: 12px;
                  margin-top: 8px;
                  display: none;
                "></div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                  <button id="save-variables-btn" style="
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                  ">Сохранить</button>
                  <button id="cancel-variables-btn" style="
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                  ">Отмена</button>
                </div>
              </div>
            \`;
          }
          
          function updateDisplay() {
            const variablesSection = document.querySelector('[data-variables-section]');
            if (variablesSection) {
              if (isEditing) {
                variablesSection.innerHTML = \`
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    border-bottom: 1px solid var(--vscode-textBlockQuote-border);
                  ">
                    <h3 style="margin: 0; color: var(--vscode-textPreformat-foreground);">Переменные шаблона</h3>
                  </div>
                  \${renderEditForm()}
                \`;
                setupEditHandlers();
              } else {
                variablesSection.innerHTML = \`
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    border-bottom: 1px solid var(--vscode-textBlockQuote-border);
                  ">
                    <h3 style="margin: 0; color: var(--vscode-textPreformat-foreground);">Переменные шаблона</h3>
                    <button id="edit-variables-btn" style="
                      background: var(--vscode-button-background);
                      color: var(--vscode-button-foreground);
                      border: none;
                      padding: 6px 12px;
                      border-radius: 4px;
                      cursor: pointer;
                      font-size: 12px;
                    ">Редактировать</button>
                  </div>
                  <div style="padding: 15px;">
                    <pre style="
                      background-color: var(--vscode-textCodeBlock-background);
                      padding: 10px;
                      border-radius: 4px;
                      font-size: 12px;
                      margin: 0;
                      border: 1px solid var(--vscode-panel-border);
                    "><code>\${JSON.stringify(currentVariables, null, 2)}</code></pre>
                  </div>
                \`;
                setupViewHandlers();
              }
            }
          }
          
          function setupViewHandlers() {
            const editBtn = document.getElementById('edit-variables-btn');
            if (editBtn) {
              editBtn.onclick = function() {
                isEditing = true;
                updateDisplay();
              };
            }
          }
          
          function setupEditHandlers() {
            const saveBtn = document.getElementById('save-variables-btn');
            const cancelBtn = document.getElementById('cancel-variables-btn');
            const editor = document.getElementById('variables-editor');
            const errorMsg = document.getElementById('error-message');
            
            if (saveBtn) {
              saveBtn.onclick = function() {
                try {
                  const newVariables = JSON.parse(editor.value);
                  currentVariables = newVariables;
                  isEditing = false;
                  updateDisplay();
                  
                  if (window.vscode) {
                    window.vscode.postMessage({
                      type: 'variablesChanged',
                      variables: newVariables
                    });
                  }
                } catch (error) {
                  errorMsg.textContent = 'Неверный формат JSON';
                  errorMsg.style.display = 'block';
                }
              };
            }
            
            if (cancelBtn) {
              cancelBtn.onclick = function() {
                isEditing = false;
                updateDisplay();
              };
            }
          }
          
          const variablesHtml = data.isFullRender ? \`
            <div data-variables-section style="
              background-color: var(--vscode-textBlockQuote-background);
              border: 1px solid var(--vscode-textBlockQuote-border);
              border-radius: 4px;
              margin-bottom: 20px;
            ">
              \${renderVariablesSection()}
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
                  \${data.isFullRender ? 'Полностью обработанный SQL с подставленными переменными' : 'SQL с развернутыми включениями'}
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
          
          if (data.isFullRender) {
            setupViewHandlers();
          }
        }
      };
    `;
  }

  public static clearCache(): void {
    this.bundleCache = null;
  }
} 