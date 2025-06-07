import React from 'react';
import { Box, Heading, Label } from '@primer/react';
import { HeaderProps } from '@presentation/components/Header/types';

export const Header: React.FC<HeaderProps> = ({ fileName, isFullRender }) => {
  return (
    <Box 
      p={3}
      borderBottom="1px solid"
      borderColor="border.default"
      bg="canvas.subtle"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Heading as="h1" sx={{ fontSize: 2, color: 'fg.default' }}>
          {fileName}
        </Heading>
        <Label 
          variant={isFullRender ? "primary" : "secondary"}
          size="large"
        >
          {isFullRender ? 'Full Render' : 'Includes Only'}
        </Label>
      </Box>
    </Box>
  );
}; 