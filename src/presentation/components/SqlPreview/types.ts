export interface SqlPreviewProps {
  fileName: string;
  sql: string;
  isFullRender: boolean;
  variables?: Record<string, any>;
} 