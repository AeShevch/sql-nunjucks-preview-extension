import React from 'react';
import { SqlContentProps, SqlToken } from '@presentation/components/SqlContent/types';

export const SqlContent: React.FC<SqlContentProps> = ({ sql }) => {
  const highlightSql = (sqlText: string): SqlToken[] => {
    const tokens: SqlToken[] = [];
    let currentIndex = 0;
    let tokenId = 0;

    // Паттерны для различных типов токенов
    const patterns = [
      {
        type: 'comment' as const,
        regex: /\/\*[\s\S]*?\*\//g,
      },
      {
        type: 'string' as const,
        regex: /'(?:[^'\\]|\\.)*'/g,
      },
      {
        type: 'keyword' as const,
        regex: /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INDEX|TABLE|DATABASE|IF|ELSE|CASE|WHEN|THEN|END|AS|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|COUNT|SUM|AVG|MIN|MAX|DISTINCT|LIMIT|OFFSET)\b/gi,
      },
    ];

    // Находим все совпадения для всех паттернов
    const allMatches: Array<{
      type: 'keyword' | 'comment' | 'string';
      match: RegExpMatchArray;
      index: number;
    }> = [];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(sqlText)) !== null) {
        if (match.index !== undefined) {
          allMatches.push({
            type: pattern.type,
            match,
            index: match.index,
          });
        }
      }
    });

    // Сортируем по позиции
    allMatches.sort((a, b) => a.index - b.index);

    // Обрабатываем токены
    allMatches.forEach(({ type, match, index }) => {
      // Добавляем текст до текущего совпадения
      if (index > currentIndex) {
        const textBefore = sqlText.slice(currentIndex, index);
        if (textBefore) {
          tokens.push({
            type: 'text',
            content: textBefore,
            key: `token-${tokenId++}`,
          });
        }
      }

      // Добавляем само совпадение
      tokens.push({
        type,
        content: match[0],
        key: `token-${tokenId++}`,
      });

      currentIndex = index + match[0].length;
    });

    // Добавляем оставшийся текст
    if (currentIndex < sqlText.length) {
      const remainingText = sqlText.slice(currentIndex);
      if (remainingText) {
        tokens.push({
          type: 'text',
          content: remainingText,
          key: `token-${tokenId++}`,
        });
      }
    }

    return tokens;
  };

  const tokens = highlightSql(sql);

  const renderToken = (token: SqlToken) => {
    const className = `sql-${token.type}`;
    
    switch (token.type) {
      case 'keyword':
        return (
          <span key={token.key} className={className}>
            {token.content}
          </span>
        );
      case 'comment':
        return (
          <span key={token.key} className={className}>
            {token.content}
          </span>
        );
      case 'string':
        return (
          <span key={token.key} className={className}>
            {token.content}
          </span>
        );
      default:
        return <span key={token.key}>{token.content}</span>;
    }
  };

  return (
    <div className="sql-content">
      {tokens.map(renderToken)}
    </div>
  );
}; 