export enum PreviewType {
    INCLUDE_EXPANSION = 'include-expansion',
    FULL_TEMPLATE_RENDER = 'full-template-render'
}

export class PreviewConfiguration {
    constructor(
        private readonly type: PreviewType,
        private readonly templateVariables?: Record<string, any>
    ) {
        this.validateConfiguration();
    }

    get previewType(): PreviewType {
        return this.type;
    }

    get variables(): Record<string, any> | undefined {
        return this.templateVariables ? { ...this.templateVariables } : undefined;
    }

    get requiresVariables(): boolean {
        return this.type === PreviewType.FULL_TEMPLATE_RENDER;
    }

    get isFullRender(): boolean {
        return this.type === PreviewType.FULL_TEMPLATE_RENDER;
    }

    get displayName(): string {
        switch (this.type) {
            case PreviewType.INCLUDE_EXPANSION:
                return 'SQL Preview с развернутыми включениями';
            case PreviewType.FULL_TEMPLATE_RENDER:
                return 'SQL Full Render с подставленными переменными';
            default:
                return 'Неизвестный тип превью';
        }
    }

    private validateConfiguration(): void {
        if (this.requiresVariables && !this.templateVariables) {
            throw new Error('Для полного рендера требуются переменные шаблона');
        }
    }

    static includeExpansionOnly(): PreviewConfiguration {
        return new PreviewConfiguration(PreviewType.INCLUDE_EXPANSION);
    }

    static fullTemplateRender(variables: Record<string, any>): PreviewConfiguration {
        return new PreviewConfiguration(PreviewType.FULL_TEMPLATE_RENDER, variables);
    }
} 