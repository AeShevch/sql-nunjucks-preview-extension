import React from 'react';
import { VariablesSectionProps } from '@presentation/components/VariablesSection/types';

export const VariablesSection: React.FC<VariablesSectionProps> = ({ variables }) => {
  return (
    <div className="variables-section">
      <h3>Template Variables:</h3>
      <pre>
        <code>{JSON.stringify(variables, null, 2)}</code>
      </pre>
    </div>
  );
}; 