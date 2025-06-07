import { PreviewOptions } from '@presentation/WebViewManager/types';

export interface ContentRenderer {
  renderPreview(sql: string, fileName: string, options: PreviewOptions): string;
  renderError(error: string): string;
} 