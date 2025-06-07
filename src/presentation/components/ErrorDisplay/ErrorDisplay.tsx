import React from 'react';
import { ErrorDisplayProps } from '@presentation/components/ErrorDisplay/types';

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="error">
      <h2>❌ SQL Processing Error</h2>
      <p>{error}</p>
    </div>
  );
}; 