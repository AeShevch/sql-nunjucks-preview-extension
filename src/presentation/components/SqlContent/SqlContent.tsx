import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, ButtonGroup, IconButton, Text } from '@primer/react';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github-dark.css';
import sqlFormatter from '@sqltools/formatter';
import { SqlContentProps } from '@presentation/components/SqlContent/types';
import { CopyIcon, SparklesFillIcon, TrackedByClosedNotPlannedIcon } from '@primer/octicons-react';

hljs.registerLanguage('sql', sql);

export const SqlContent: React.FC<SqlContentProps> = ({ sql: sqlContent }) => {
  const codeRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isBeautified, setIsBeautified] = useState(() => {
    return localStorage.getItem('sqlContent.isBeautified') === 'true';
  });
  const [isCommentsShown, setIsCommentsShown] = useState(() => {
    return localStorage.getItem('sqlContent.isCommentsShown') !== 'false';
  });

  const unescapeQuotes = (content: string): string => {
    return content
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
  };

  const beautifySQL = (sql: string): string => {
    try {
      return sqlFormatter.format(sql, {
        language: 'sql',
        indent: '  ',
        reservedWordCase: 'upper',
        linesBetweenQueries: 1,
      });
    } catch (error) {
      console.warn('SQL formatting failed:', error);
      return sql;
    }
  };

  const hideComments = (content: string): string => {
    return content
      .split('\n')
      .filter(line => {
        const trimmedLine = line.trim();
        return !trimmedLine.includes('=== INCLUDED FROM') && 
               !trimmedLine.includes('===INCLUDED FROM') &&
               !trimmedLine.includes('=== END INCLUDE:') &&
               !trimmedLine.includes('===END INCLUDE:') &&
               !trimmedLine.match(/^--.*=== INCLUDED FROM/i) &&
               !trimmedLine.match(/^\/\*.*=== INCLUDED FROM/i) &&
               !trimmedLine.match(/^--.*=== END INCLUDE:/i) &&
               !trimmedLine.match(/^\/\*.*=== END INCLUDE:/i);
      })
      .join('\n');
  };

  const processContent = (content: string): string => {
    let processed = unescapeQuotes(content);
    
    if (!isCommentsShown) {
      processed = hideComments(processed);
    }
    
    if (isBeautified) {
      processed = beautifySQL(processed);
    }
    
    return processed;
  };

  const displayContent = processContent(sqlContent);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(displayContent);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleBeautifyClick = () => {
    const newValue = !isBeautified;
    setIsBeautified(newValue);
    localStorage.setItem('sqlContent.isBeautified', newValue.toString());
  };

  const handleCommentsToggleClick = () => {
    const newValue = !isCommentsShown;
    setIsCommentsShown(newValue);
    localStorage.setItem('sqlContent.isCommentsShown', newValue.toString());
  };

  useEffect(() => {
    if (codeRef.current && displayContent) {
      codeRef.current.removeAttribute('data-highlighted');
      codeRef.current.className = 'language-sql hljs';
      
      codeRef.current.textContent = displayContent;
      hljs.highlightElement(codeRef.current);

      if (containerRef.current) {
        const lines = displayContent.split('\n');
        const lineNumbersHtml = lines
          .map((_, index) => `<span class="line-number">${index + 1}</span>`)
          .join('');

        const lineNumbersDiv = containerRef.current.querySelector('.line-numbers');
        if (lineNumbersDiv) {
          lineNumbersDiv.innerHTML = lineNumbersHtml;
        }
      }
    }
  }, [displayContent, isBeautified, isCommentsShown]);

  return (
    <Box>
      <Box
        bg="canvas.subtle"
        borderBottom="1px solid"
        borderColor="border.default"
        px={3}
        py={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontSize={1} fontWeight="semibold" color="fg.muted">
          SQL
        </Text>
        <ButtonGroup>
          <IconButton
            style={{
              backgroundColor: '#212830',
              borderColor: '#3d444d',
              color: isBeautified ? '#fff' : '#9198a1',
            }}
            size="small"
            icon={SparklesFillIcon}
            tooltipDirection="n"
            aria-label={isBeautified ? 'Unbeautify SQL' : 'Beautify SQL'}
            onClick={handleBeautifyClick}
          />

          <IconButton
            style={{
              backgroundColor: '#212830',
              borderColor: '#3d444d',
              color: !isCommentsShown ? '#fff' : '#9198a1',
            }}
            size="small"
            icon={TrackedByClosedNotPlannedIcon}
            tooltipDirection="n"
            aria-label={isCommentsShown ? 'Hide comments' : 'Show comments'}
            onClick={handleCommentsToggleClick}
          />

          <IconButton
            style={{
              backgroundColor: '#212830',
              borderColor: '#3d444d',
              color: isCopied ? '#fff' : '#9198a1',
            }}
            className="ml-2"
            size="small"
            onClick={handleCopyClick}
            aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
            icon={CopyIcon}
            tooltipDirection="n"
          />
        </ButtonGroup>
      </Box>
      <Box p={3} bg="canvas.default">
        <Box
          ref={containerRef}
          border="1px solid"
          borderColor="border.default"
          borderRadius={2}
          overflow="hidden"
          bg="canvas.subtle"
          sx={{
            display: 'flex',
            '& .line-numbers': {
              minWidth: '40px',
              padding: '12px 8px 12px 12px',
              backgroundColor: 'canvas.default',
              borderRight: '1px solid',
              borderRightColor: 'border.default',
              color: 'fg.muted',
              fontSize: 1,
              lineHeight: '1.45',
              fontFamily: 'mono',
              textAlign: 'right',
              userSelect: 'none',
              '& .line-number': {
                display: 'block',
              },
            },
            '& .code-content': {
              flex: 1,
              overflow: 'auto',
            },
          }}
        >
          <div className="line-numbers"></div>
          <Box
            className="code-content"
            as="pre"
            fontSize={1}
            lineHeight="1.45"
            fontFamily="mono"
            m={0}
          >
            <code ref={codeRef} className="language-sql hljs">
              {displayContent}
            </code>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
