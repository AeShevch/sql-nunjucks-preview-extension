import React from 'react';
import { Box, Text } from '@primer/react';
import { VariablesSectionProps } from '@presentation/components/VariablesSection/types';

export const VariablesSection: React.FC<VariablesSectionProps> = ({ variables }) => {
  return (
    <Box>
      <Box
        bg="canvas.subtle"
        borderBottom="1px solid"
        borderColor="border.default"
        px={3}
        py={2}
      >
        <Text fontSize={1} fontWeight="semibold" color="fg.muted">
          Template Variables
        </Text>
      </Box>
      <Box p={3} bg="canvas.default">
        <Box
          as="pre"
          bg="canvas.subtle"
          p={3}
          borderRadius={2}
          border="1px solid"
          borderColor="border.default"
          fontSize={1}
          lineHeight="1.45"
          overflow="auto"
          fontFamily="mono"
        >
          <code>
            {JSON.stringify(variables, null, 2)}
          </code>
        </Box>
      </Box>
    </Box>
  );
}; 