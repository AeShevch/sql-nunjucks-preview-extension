export interface SqlDocument {
    fileName: string;
    content: string;
}

export interface PreviewOptions {
    isFullRender: boolean;
    variables?: Record<string, any>;
}

export interface IncludeResolver {
    resolve(filePath: string, content: string): string;
}

export interface TemplateRenderer {
    render(template: string, variables: Record<string, any>): string;
}

export interface WebViewManager {
    showPreview(document: SqlDocument, options: PreviewOptions): void;
    updatePreview(document: SqlDocument, options: PreviewOptions): void;
    dispose(): void;
}

export interface FileSystemAdapter {
    readFile(path: string): string;
    exists(path: string): boolean;
    getWorkspaceRoot(): string;
}

export interface VariableProvider {
    getVariables(): Promise<Record<string, any> | undefined>;
}

export interface ContentRenderer {
    renderPreview(sql: string, fileName: string, options: PreviewOptions): string;
    renderError(error: string): string;
}

export interface DocumentWatcher {
    watch(callback: (document: SqlDocument) => void): void;
    dispose(): void;
}

export enum RenderStrategy {
    INCLUDE_ONLY = 'include-only',
    FULL_RENDER = 'full-render'
}

export interface RenderResult {
    content: string;
    variables?: Record<string, any>;
    error?: string;
} 