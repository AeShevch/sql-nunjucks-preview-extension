import React from 'react';
import { Flash } from '@primer/react';
import { ErrorDisplayProps } from '@presentation/components/ErrorDisplay/types';

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <Flash variant="danger" sx={{ m: 3 }}>
      <strong>Error: </strong>
      {error}
    </Flash>
  );
}; 