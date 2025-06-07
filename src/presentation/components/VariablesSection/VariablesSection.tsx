import React, { useState } from 'react';
import { Box, Text, TextInput, Button } from '@primer/react';
import { VariablesSectionProps } from '@presentation/components/VariablesSection/types';

export const VariablesSection: React.FC<VariablesSectionProps> = ({ 
  variables = {}, 
  onVariablesChange,
  isEditable = true 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditValue(JSON.stringify(variables, null, 2));
    setIsEditing(true);
    setError(null);
  };

  const handleSave = () => {
    try {
      const parsedVariables = JSON.parse(editValue);
      onVariablesChange?.(parsedVariables);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Неверный формат JSON');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  return (
    <Box>
      <Box
        bg="canvas.subtle"
        borderBottom="1px solid"
        borderColor="border.default"
        px={3}
        py={2}
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <Text fontSize={1} fontWeight="semibold" color="fg.muted">
          Template variables
        </Text>
        {isEditable && !isEditing && (
          <Button size="small" onClick={handleStartEdit} style={{ backgroundColor: '#212830', borderColor: '#3d444d' }} >
            Edit
          </Button>
        )}
      </Box>
      <Box p={3} bg="canvas.default">
        {isEditing ? (
          <Box>
            <Box mb={3}>
              <TextInput
                as="textarea"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                sx={{
                  width: '100%',
                  minHeight: '150px',
                  fontFamily: 'mono',
                  fontSize: 1,
                  resize: 'vertical'
                }}
                placeholder='{"key": "value"}'
              />
            </Box>
            {error && (
              <Box mb={3}>
                <Text fontSize={1} color="danger.fg">
                  {error}
                </Text>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button size="small" variant="primary" onClick={handleSave}>
                Save
              </Button>
              <Button size="small" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
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
        )}
      </Box>
    </Box>
  );
}; 