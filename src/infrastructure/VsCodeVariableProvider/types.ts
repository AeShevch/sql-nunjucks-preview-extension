export interface VariableProvider {
  getVariables(): Promise<Record<string, any> | undefined>;
}
