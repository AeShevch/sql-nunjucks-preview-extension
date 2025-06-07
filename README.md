# SQL Nunjucks Preview Extension

Расширение VSCode для превью SQL файлов с поддержкой шаблонов Nunjucks.

## Недавние изменения

### Переход на React компоненты

Превью теперь рендерится с помощью React компонентов вместо обычных строк HTML. Это обеспечивает:

- **Лучшую структуру кода**: Каждый элемент интерфейса выделен в отдельный компонент
- **Переиспользуемость**: Компоненты можно легко переиспользовать и тестировать
- **Типизацию**: Полная поддержка TypeScript для всех компонентов
- **Расширяемость**: Легко добавлять новые функции и компоненты

### Архитектура компонентов

```
src/presentation/components/
├── App/
│   ├── App.tsx             # Основной компонент приложения
│   ├── types.ts            # Типы для App
│   └── index.ts            # Экспорт App
├── SqlPreview/
│   ├── SqlPreview.tsx      # Компонент превью SQL
│   ├── types.ts            # Типы для SqlPreview
│   └── index.ts            # Экспорт SqlPreview
├── Header/
│   ├── Header.tsx          # Заголовок превью
│   ├── types.ts            # Типы для Header
│   └── index.ts            # Экспорт Header
├── VariablesSection/
│   ├── VariablesSection.tsx # Секция переменных шаблона
│   ├── types.ts            # Типы для VariablesSection
│   └── index.ts            # Экспорт VariablesSection
├── SqlContent/
│   ├── SqlContent.tsx      # Контент SQL с подсветкой синтаксиса
│   ├── types.ts            # Типы для SqlContent
│   └── index.ts            # Экспорт SqlContent
├── ErrorDisplay/
│   ├── ErrorDisplay.tsx    # Отображение ошибок
│   ├── types.ts            # Типы для ErrorDisplay
│   └── index.ts            # Экспорт ErrorDisplay
├── styles.css              # Общие стили компонентов
├── index.tsx               # Точка входа React приложения
└── index.ts                # Общий экспорт всех компонентов
```

#### Преимущества новой структуры

- **Модульность**: Каждый компонент изолирован в своей папке
- **Типизация**: Типы вынесены в отдельные файлы `types.ts`
- **Переиспользуемость**: Простые импорты через индексные файлы
- **Масштабируемость**: Легко добавлять новые компоненты и функции

### Новые классы

- `ReactContentRenderer` - Рендерер контента с использованием React
- `BundleEmbedder` - Утилита для встраивания React bundle в HTML

## Использование

1. Откройте SQL файл в VSCode
2. Используйте команды:
   - `Ctrl+Shift+V` (Mac: `Cmd+Shift+V`) - Показать превью (только includes)
   - `Ctrl+Shift+F` (Mac: `Cmd+Shift+F`) - Показать полный рендер

Или используйте кнопки в панели редактора.

## Разработка

### Сборка

```bash
npm run compile
```

### Структура проекта

- `src/presentation/ContentRenderer/` - Рендереры контента
- `src/presentation/components/` - React компоненты
- `src/presentation/WebViewManager/` - Управление веб-видами
- `webpack.config.js` - Конфигурация сборки (поддерживает два entry point)

### Технологии

- TypeScript
- React 18
- Webpack 5
- VSCode Extension API
- Nunjucks
- TSyringe (DI) 