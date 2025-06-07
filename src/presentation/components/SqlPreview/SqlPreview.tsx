import React from 'react';
import { Header } from '@presentation/components/Header';
import { VariablesSection } from '@presentation/components/VariablesSection';
import { SqlContent } from '@presentation/components/SqlContent';
import { SqlPreviewProps } from '@presentation/components/SqlPreview/types';

export const SqlPreview: React.FC<SqlPreviewProps> = ({
  fileName,
  sql,
  isFullRender,
  variables
}) => {
  return (
    <div className="sql-preview">
      <Header fileName={fileName} isFullRender={isFullRender} />
      {variables && <VariablesSection variables={variables} />}
      <SqlContent sql={sql} />
    </div>
  );
}; 