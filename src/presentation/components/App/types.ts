export interface AppProps {
  type: 'preview' | 'error';
  data: {
    fileName?: string;
    sql?: string;
    isFullRender?: boolean;
    variables?: Record<string, any>;
    error?: string;
  };
} 