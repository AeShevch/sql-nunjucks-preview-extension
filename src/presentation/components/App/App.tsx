import React from 'react';
import { ThemeProvider, BaseStyles } from '@primer/react';
import { SqlPreview } from '@presentation/components/SqlPreview/SqlPreview';
import { ErrorDisplay } from '@presentation/components/ErrorDisplay/ErrorDisplay';
import { AppProps } from '@presentation/components/App/types';

export const App: React.FC<AppProps> = ({ type, data }) => {
  return (
    <ThemeProvider colorMode="dark">
      <BaseStyles>
        {type === 'error' ? (
          <ErrorDisplay error={data.error || 'Unknown error'} />
        ) : (
          <SqlPreview
            fileName={data.fileName || 'Unknown'}
            sql={data.sql || ''}
            isFullRender={data.isFullRender || false}
            variables={data.variables}
          />
        )}
      </BaseStyles>
    </ThemeProvider>
  );
}; 