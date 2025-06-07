# SQL Nunjucks Preview

A powerful VS Code extension for previewing SQL files with Nunjucks template support. Resolve includes, render templates with variables, and interactively edit template variables.

## Features

- 🔄 **Include Resolution**: Automatically resolves `{% include %}` statements in SQL files
- 🎯 **Template Rendering**: Full Nunjucks template support with variable substitution
- ⚡ **Interactive Variables**: Edit template variables directly in the preview interface
- 🔧 **Auto Variable Detection**: Automatically extracts variables from your templates
- 📋 **Copy to Clipboard**: Easy copy of rendered SQL with one click
- 🎨 **Syntax Highlighting**: Beautiful SQL syntax highlighting in preview
- 🔄 **Live Updates**: Preview updates automatically when files change

## Usage

### Quick Start

1. Open any `.sql` file in VS Code
2. Use `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) to show preview with includes
3. Use `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) for full template rendering

### Available Commands

- **SQL Nunjucks: Show SQL Preview (includes only)** - Shows SQL with resolved includes
- **SQL Nunjucks: Show SQL Full Render** - Shows fully rendered SQL with variables

### Template Variables

The extension automatically detects variables in your SQL templates:

```sql
-- Variables are automatically extracted from:
{{ variable_name }}
{% if condition_variable %}
{% for item in array_variable %}
```

In the **Full Render** mode, you can:
- Edit variables in JSON format
- Save changes to update the preview instantly
- Variables persist between sessions

### Example

**Input SQL file:**
```sql
SELECT *
FROM {{ table_name }}
WHERE status = '{{ status }}'
{% if date_filter %}
  AND created_date >= '{{ start_date }}'
{% endif %}
```

**Variables:**
```json
{
  "table_name": "users",
  "status": "active",
  "date_filter": true,
  "start_date": "2024-01-01"
}
```

**Rendered Output:**
```sql
SELECT *
FROM users
WHERE status = 'active'
  AND created_date >= '2024-01-01'
```

## Supported Template Features

- ✅ Variable substitution: `{{ variable }}`
- ✅ Conditional blocks: `{% if %}`, `{% elif %}`, `{% else %}`, `{% endif %}`
- ✅ Loops: `{% for %}`, `{% endfor %}`
- ✅ Include statements: `{% include 'path/to/file.sql' %}`
- ✅ String concatenation: `{{ var1 ~ var2 }}`
- ✅ Filters and operators
- ✅ Complex expressions

## File Include Resolution

The extension resolves include paths relative to your workspace:

```sql
{% include 'shared/common_filters.sql' %}
{% include 'dashboard/metrics/base.sql' %}
```

Includes are processed recursively with circular dependency protection.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+V` / `Cmd+Shift+V` | Show SQL Preview (includes only) |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Show SQL Full Render |

## Installation

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Search for "SQL Nunjucks Preview"
4. Click Install

## Requirements

- VS Code 1.85.0 or higher
- SQL files with `.sql` extension

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/your-username/sql-nunjucks-preview-extension).

## License

MIT License - see LICENSE file for details. 