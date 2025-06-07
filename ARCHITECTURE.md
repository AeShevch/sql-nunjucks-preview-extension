# Архитектура SQL Nunjucks Preview Extension

## Обзор

Расширение построено с использованием **слоистой архитектуры** и принципов **SOLID**, что обеспечивает легкость тестирования, расширения и поддержки.

## Архитектурные слои

### 1. Infrastructure Layer (`src/infrastructure/`)
Отвечает за интеграцию с внешними системами:
- **FileSystemAdapter** - работа с файловой системой
- **NunjucksAdapter** - интеграция с шаблонизатором Nunjucks
- **VsCodeVariableProvider** - получение переменных от пользователя
- **DocumentWatcher** - наблюдение за изменениями документов

### 2. Domain Layer (`src/domain/`)
Содержит бизнес-логику:
- **IncludeResolver** - разрешение включений SQL файлов
- **SqlProcessor** - основная обработка SQL с использованием Strategy Pattern

### 3. Application Layer (`src/application/`)
Координирует взаимодействие между слоями:
- **PreviewService** - основной сервис для показа превью

### 4. Presentation Layer (`src/presentation/`)
Отвечает за пользовательский интерфейс:
- **ContentRenderer** - рендеринг HTML контента
- **WebViewManager** - управление WebView панелями

### 5. Commands Layer (`src/commands/`)
Реализует команды VS Code:
- **ShowPreviewCommand** - команда показа превью
- **ShowFullRenderCommand** - команда полного рендеринга

## Применяемые паттерны проектирования

### 1. Strategy Pattern
```typescript
// Разные стратегии рендеринга SQL
export enum RenderStrategy {
    INCLUDE_ONLY = 'include-only',
    FULL_RENDER = 'full-render'
}
```

### 2. Command Pattern
```typescript
export interface Command {
    execute(): Promise<void>;
}
```

### 3. Factory Pattern
```typescript
export interface WebViewFactory {
    createWebView(title: string): vscode.WebviewPanel;
}
```

### 4. Observer Pattern
```typescript
documentWatcher.watch((document) => {
    previewService.updatePreview(document);
});
```

### 5. Dependency Injection
```typescript
export class DIContainer {
    // Simple DI container для управления зависимостями
}
```

## Принципы SOLID

### Single Responsibility Principle (SRP)
Каждый класс имеет одну ответственность:
- `SqlIncludeResolver` - только разрешение включений
- `HtmlContentRenderer` - только рендеринг HTML
- `VsCodeWebViewManager` - только управление WebView

### Open/Closed Principle (OCP)
Система открыта для расширения через интерфейсы:
- Новые стратегии рендеринга через `SqlRenderStrategy`
- Новые провайдеры переменных через `VariableProvider`

### Liskov Substitution Principle (LSP)
Реализации интерфейсов взаимозаменяемы:
```typescript
// Можно заменить на любую другую реализацию
const fileSystem: FileSystemAdapter = new VsCodeFileSystemAdapter();
```

### Interface Segregation Principle (ISP)
Интерфейсы специфичны и не содержат лишних методов:
- `IncludeResolver` - только разрешение
- `TemplateRenderer` - только рендеринг

### Dependency Inversion Principle (DIP)
Зависимости от абстракций, а не от конкретных классов:
```typescript
constructor(
    private includeResolver: IncludeResolver, // интерфейс
    private templateRenderer: TemplateRenderer // интерфейс
) {}
```

## Структура файлов

```
src/
├── types/                  # Интерфейсы и типы
│   └── index.ts
├── infrastructure/         # Внешние интеграции
│   ├── FileSystemAdapter.ts
│   ├── NunjucksAdapter.ts
│   ├── VsCodeVariableProvider.ts
│   └── DocumentWatcher.ts
├── domain/                 # Бизнес-логика
│   ├── IncludeResolver.ts
│   └── SqlProcessor.ts
├── application/            # Сервисы приложения
│   └── PreviewService.ts
├── presentation/           # UI компоненты
│   ├── ContentRenderer.ts
│   └── WebViewManager.ts
├── commands/               # VS Code команды
│   └── PreviewCommands.ts
├── container/              # DI контейнер
│   └── DIContainer.ts
├── extension.ts            # Точка входа
└── index.ts               # Экспорты
```

## Преимущества архитектуры

1. **Тестируемость** - каждый компонент можно тестировать изолированно
2. **Расширяемость** - легко добавлять новые функции
3. **Поддерживаемость** - четкое разделение ответственности
4. **Гибкость** - возможность замены реализаций без изменения других компонентов

## Как расширять

### Добавление новой стратегии рендеринга
1. Создать новую реализацию `SqlRenderStrategy`
2. Зарегистрировать в `SqlProcessor`

### Добавление нового провайдера переменных
1. Реализовать интерфейс `VariableProvider`
2. Зарегистрировать в DI контейнере

### Добавление новой команды
1. Реализовать интерфейс `Command`
2. Зарегистрировать в `CommandRegistry` 