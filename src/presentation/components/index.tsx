import React from 'react';
import { createRoot } from 'react-dom/client';
// eslint-disable-next-line no-restricted-imports
import { App, AppProps } from './App';

export function renderReactApp(containerId: string, props: AppProps): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(<App {...props} />);
}

declare global {
  interface Window {
    renderSqlPreview: (props: AppProps) => void;
  }
}

window.renderSqlPreview = (props: AppProps) => {
  renderReactApp('react-root', props);
};
