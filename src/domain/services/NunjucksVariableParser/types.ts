export interface VariableParser {
  extractVariables(sqlContent: string): Record<string, any>;
  validateVariableNames(variables: Record<string, any>): boolean;
}
