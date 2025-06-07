export class ProcessedSql {
    constructor(
        private readonly content: string,
        private readonly variables?: Record<string, any>,
        private readonly processingSteps: string[] = []
    ) {
        if (!content.trim()) {
            throw new Error('Processed SQL cannot be empty');
        }
    }

    public get sqlContent(): string {
        return this.content;
    }

    public get usedVariables(): Record<string, any> | undefined {
        return this.variables ? { ...this.variables } : undefined;
    }

    public get processingHistory(): readonly string[] {
        return [...this.processingSteps];
    }

    public hasVariables(): boolean {
        return this.variables !== undefined && Object.keys(this.variables).length > 0;
    }

    public withAdditionalProcessingStep(step: string): ProcessedSql {
        return new ProcessedSql(
            this.content,
            this.variables,
            [...this.processingSteps, step]
        );
    }

    public static fromContent(content: string): ProcessedSql {
        return new ProcessedSql(content);
    }

    public static fromTemplateRender(content: string, variables: Record<string, any>): ProcessedSql {
        return new ProcessedSql(content, variables, ['template-rendered']);
    }
} 