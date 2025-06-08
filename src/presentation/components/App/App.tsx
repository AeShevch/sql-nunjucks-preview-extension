import React, { useCallback } from 'react';
import { ThemeProvider, BaseStyles } from '@primer/react';
import { SqlPreview } from '@presentation/components/SqlPreview/SqlPreview';
import { ErrorDisplay } from '@presentation/components/ErrorDisplay/ErrorDisplay';
import { AppProps } from '@presentation/components/App/types';

declare global {
  interface Window {
    vscode?: {
      postMessage: (message: any) => void;
    };
  }
}

export const App: React.FC<AppProps> = ({ type, data }) => {
  const handleVariablesChange = useCallback((variables: Record<string, any>) => {
    if (window.vscode) {
      window.vscode.postMessage({
        type: 'variablesChanged',
        variables: variables,
      });
    }
  }, []);

  return (
    <ThemeProvider colorMode="night">
      <BaseStyles>
        {type === 'error' ? (
          <ErrorDisplay error={data.error || 'Unknown error'} />
        ) : (
          <SqlPreview
            fileName={data.fileName || 'Unknown'}
            sql={data.sql || ''}
            isFullRender={data.isFullRender || false}
            variables={data.variables}
            onVariablesChange={handleVariablesChange}
          />
        )}
      </BaseStyles>
    </ThemeProvider>
  );
};
