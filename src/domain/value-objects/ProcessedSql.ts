export class ProcessedSql {
    constructor(
        private readonly content: string,
        private readonly variables?: Record<string, any>,
        private readonly processingSteps: string[] = []
    ) {
        if (!content.trim()) {
            throw new Error('Обработанный SQL не может быть пустым');
        }
    }

    get sqlContent(): string {
        return this.content;
    }

    get usedVariables(): Record<string, any> | undefined {
        return this.variables ? { ...this.variables } : undefined;
    }

    get processingHistory(): readonly string[] {
        return [...this.processingSteps];
    }

    hasVariables(): boolean {
        return this.variables !== undefined && Object.keys(this.variables).length > 0;
    }

    withAdditionalProcessingStep(step: string): ProcessedSql {
        return new ProcessedSql(
            this.content,
            this.variables,
            [...this.processingSteps, step]
        );
    }

    static fromContent(content: string): ProcessedSql {
        return new ProcessedSql(content);
    }

    static fromTemplateRender(content: string, variables: Record<string, any>): ProcessedSql {
        return new ProcessedSql(content, variables, ['template-rendered']);
    }
} 