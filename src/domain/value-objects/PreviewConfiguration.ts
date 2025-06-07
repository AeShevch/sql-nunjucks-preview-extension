export enum PreviewType {
  INCLUDE_EXPANSION = 'include-expansion',
  FULL_TEMPLATE_RENDER = 'full-template-render',
}

export class PreviewConfiguration {
  constructor(
    private readonly type: PreviewType,
    private readonly templateVariables?: Record<string, any>
  ) {
    this.validateConfiguration();
  }

  public get previewType(): PreviewType {
    return this.type;
  }

  public get variables(): Record<string, any> | undefined {
    return this.templateVariables ? { ...this.templateVariables } : undefined;
  }

  public get requiresVariables(): boolean {
    return this.type === PreviewType.FULL_TEMPLATE_RENDER;
  }

  public get isFullRender(): boolean {
    return this.type === PreviewType.FULL_TEMPLATE_RENDER;
  }

  public get displayName(): string {
    switch (this.type) {
      case PreviewType.INCLUDE_EXPANSION:
        return 'SQL Preview with expanded includes';
      case PreviewType.FULL_TEMPLATE_RENDER:
        return 'SQL Full Render with substituted variables';
      default:
        return 'Unknown preview type';
    }
  }

  private validateConfiguration(): void {
    if (this.requiresVariables && !this.templateVariables) {
      throw new Error('Template variables are required for full render');
    }
  }

  public static includeExpansionOnly(): PreviewConfiguration {
    return new PreviewConfiguration(PreviewType.INCLUDE_EXPANSION);
  }

  public static fullTemplateRender(variables: Record<string, any>): PreviewConfiguration {
    return new PreviewConfiguration(PreviewType.FULL_TEMPLATE_RENDER, variables);
  }
}
