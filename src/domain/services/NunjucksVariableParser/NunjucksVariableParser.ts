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

    const allVariablesRegex = /{{\s*([^}]+)\s*}}/g;
    while ((match = allVariablesRegex.exec(sqlContent)) !== null) {
      const expression = match[1];
      const foundVars = this.extractVariablesFromExpression(expression);
      
      foundVars.forEach(varName => {
        if (!loopIterators.has(varName)) {
          variableNames.add(varName);
        }
      });
    }

    const conditionalRegex = /{%\s*(?:if|elif)\s+([^%]+)%}/g;
    while ((match = conditionalRegex.exec(sqlContent)) !== null) {
      const condition = match[1].trim();
      const foundVars = this.extractVariablesFromExpression(condition);
      
      foundVars.forEach(varName => {
        if (!loopIterators.has(varName)) {
          variableNames.add(varName);
        }
      });
    }

    const loopRegex = /{%\s*for\s+\w+\s+in\s+(\w+(?:\.\w+)*)/g;
    while ((match = loopRegex.exec(sqlContent)) !== null) {
      const fullPath = match[1];
      const rootVariable = fullPath.split('.')[0];
      variableNames.add(rootVariable);
    }

    variableNames.forEach(name => {
      variables[name] = "";
    });

    return variables;
  }

  private extractVariablesFromExpression(expression: string): string[] {
    const variables: string[] = [];
    
    const cleanExpression = expression
      .replace(/'[^']*'/g, '')
      .replace(/"[^"]*"/g, '')
      .replace(/\b\d+\.?\d*\b/g, '')
      .replace(/\b(true|false|null|undefined)\b/g, '');

    const variableRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\b/g;
    let match;
    
    while ((match = variableRegex.exec(cleanExpression)) !== null) {
      const fullPath = match[1];
      const rootVariable = fullPath.split('.')[0];
      
      if (!this.isNunjucksKeyword(rootVariable)) {
        variables.push(rootVariable);
      }
    }

    return [...new Set(variables)];
  }

  private isNunjucksKeyword(word: string): boolean {
    const keywords = [
      'and', 'or', 'not', 'in', 'is', 'if', 'else', 'elif', 'endif',
      'for', 'endfor', 'set', 'endset', 'block', 'endblock', 'extends',
      'include', 'import', 'from', 'as', 'with', 'without', 'context',
      'loop', 'super', 'self', 'varargs', 'kwargs', 'caller'
    ];
    
    return keywords.includes(word.toLowerCase());
  }

  public validateVariableNames(variables: Record<string, any>): boolean {
    const validNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    
    return Object.keys(variables).every(name => validNameRegex.test(name));
  }
} 