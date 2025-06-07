export interface SqlPreviewProps {
  fileName: string;
  sql: string;
  isFullRender: boolean;
  variables?: Record<string, any>;
  onVariablesChange?: (variables: Record<string, any>) => void;
} 