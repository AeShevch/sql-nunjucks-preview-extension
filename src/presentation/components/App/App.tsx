import React from 'react';
import { SqlPreview } from '@presentation/components/SqlPreview';
import { ErrorDisplay } from '@presentation/components/ErrorDisplay';
import { AppProps } from '@presentation/components/App/types';
import '@presentation/components/styles.css';

export const App: React.FC<AppProps> = ({ type, data }) => {
  if (type === 'error') {
    return <ErrorDisplay error={data.error || 'Unknown error'} />;
  }

  return (
    <SqlPreview
      fileName={data.fileName || 'Unknown'}
      sql={data.sql || ''}
      isFullRender={data.isFullRender || false}
      variables={data.variables}
    />
  );
}; 