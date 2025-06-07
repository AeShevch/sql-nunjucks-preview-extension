import { VariableParser } from '@domain/services/NunjucksVariableParser/types';
import { injectable } from 'tsyringe';

@injectable()
export class NunjucksVariableParser implements VariableParser {
  public extractVariables(sqlContent: string): Record<string, any> {
    const variables: Record<string, any> = {};
    const variableNames = new Set<string>();
    const loopIterators = new Set<string>();

    const loopIteratorRegex = /{%\s*for\s+(\w+)\s+in\s+\w+/g;
    let match;
    while ((match = loopIteratorRegex.exec(sqlContent)) !== null) {
      loopIterators.add(match[1]);
    }

    const simpleVariableRegex = /{{\s*(\w+)\s*}}/g;
    while ((match = simpleVariableRegex.exec(sqlContent)) !== null) {
      const variableName = match[1];
      if (!loopIterators.has(variableName)) {
        variableNames.add(variableName);
      }
    }

    const dotNotationRegex = /{{\s*(\w+(?:\.\w+)*)\s*}}/g;
    while ((match = dotNotationRegex.exec(sqlContent)) !== null) {
      const fullPath = match[1];
      const rootVariable = fullPath.split('.')[0];
      if (!loopIterators.has(rootVariable)) {
        variableNames.add(rootVariable);
      }
    }

    const conditionalRegex = /{%\s*(?:if|elif)\s+(\w+(?:\.\w+)*)/g;
    while ((match = conditionalRegex.exec(sqlContent)) !== null) {
      const fullPath = match[1];
      const rootVariable = fullPath.split('.')[0];
      if (!loopIterators.has(rootVariable)) {
        variableNames.add(rootVariable);
      }
    }

    const loopRegex = /{%\s*for\s+\w+\s+in\s+(\w+(?:\.\w+)*)/g;
    while ((match = loopRegex.exec(sqlContent)) !== null) {
      const fullPath = match[1];
      const rootVariable = fullPath.split('.')[0];
      variableNames.add(rootVariable);
    }

    const filterRegex = /{{\s*(\w+(?:\.\w+)*)\s*\|/g;
    while ((match = filterRegex.exec(sqlContent)) !== null) {
      const fullPath = match[1];
      const rootVariable = fullPath.split('.')[0];
      if (!loopIterators.has(rootVariable)) {
        variableNames.add(rootVariable);
      }
    }

    variableNames.forEach(name => {
      variables[name] = "";
    });

    return variables;
  }

  public validateVariableNames(variables: Record<string, any>): boolean {
    const validNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    
    return Object.keys(variables).every(name => validNameRegex.test(name));
  }
} 