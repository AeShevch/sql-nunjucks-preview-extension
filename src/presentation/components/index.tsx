import React from 'react';
import { createRoot } from 'react-dom/client';
import { App, AppProps } from '@presentation/components/App';

// Функция для рендеринга React приложения
export function renderReactApp(containerId: string, props: AppProps): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(<App {...props} />);
}

// Глобальный доступ для вызова из HTML
declare global {
  interface Window {
    renderSqlPreview: (props: AppProps) => void;
  }
}

window.renderSqlPreview = (props: AppProps) => {
  renderReactApp('react-root', props);
}; 