import React from 'react';
import { HeaderProps } from '@presentation/components/Header/types';

export const Header: React.FC<HeaderProps> = ({ fileName, isFullRender }) => {
  return (
    <div className="header">
      <h1>
        {isFullRender ? '🔧 SQL Full Render' : '📋 SQL Preview'} - {fileName}
      </h1>
      <p>
        {isFullRender 
          ? 'Fully processed SQL with substituted variables' 
          : 'SQL with expanded includes'
        }
      </p>
    </div>
  );
}; 