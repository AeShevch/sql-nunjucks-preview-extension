export interface VariablesSectionProps {
  variables?: Record<string, any>;
  onVariablesChange?: (variables: Record<string, any>) => void;
  isEditable?: boolean;
} 