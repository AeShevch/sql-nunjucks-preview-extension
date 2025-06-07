import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Text } from '@primer/react';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github-dark.css';
import { SqlContentProps } from '@presentation/components/SqlContent/types';
import {CopyIcon} from '@primer/octicons-react'

hljs.registerLanguage('sql', sql);

export const SqlContent: React.FC<SqlContentProps> = ({ sql: sqlContent }) => {
  const codeRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const unescapeQuotes = (content: string): string => {
    return content
      .replace(/\\'/g, "'")           // \' -> '
      .replace(/\\"/g, '"')           // \" -> "
      .replace(/''/g, "'");           // '' -> '
  };

  const displayContent = unescapeQuotes(sqlContent);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  useEffect(() => {
    if (codeRef.current && displayContent) {
      codeRef.current.innerHTML = displayContent;
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
  }, [displayContent]);

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
        <IconButton 
            style={{ backgroundColor: '#212830', borderColor: '#3d444d', color: '#9198a1' }} 
            size="small" 
            onClick={handleCopy} 
            aria-label={isCopied ? 'Copied' : 'Copy to clipboard'} 
            icon={CopyIcon} 
            tooltipDirection='n'
        />
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
              }
            },
            '& .code-content': {
              flex: 1,
              overflow: 'auto',
            }
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