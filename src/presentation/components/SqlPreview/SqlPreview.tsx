import React from 'react';
import { Box } from '@primer/react';
import { Header } from '@presentation/components/Header/Header';
import { VariablesSection } from '@presentation/components/VariablesSection/VariablesSection';
import { SqlContent } from '@presentation/components/SqlContent/SqlContent';
import { SqlPreviewProps } from '@presentation/components/SqlPreview/types';

export const SqlPreview: React.FC<SqlPreviewProps> = ({
  fileName,
  sql,
  isFullRender,
  variables,
  onVariablesChange
}) => {
  return (
    <Box 
      border="1px solid"
      borderColor="border.default"
      borderRadius={2}
      bg="canvas.default"
      overflow="hidden"
    >
      <Header fileName={fileName} isFullRender={isFullRender} />
      {isFullRender && (
        <VariablesSection 
          variables={variables} 
          onVariablesChange={onVariablesChange}
          isEditable={true}
        />
      )}
      <SqlContent sql={sql} />
    </Box>
  );
}; 