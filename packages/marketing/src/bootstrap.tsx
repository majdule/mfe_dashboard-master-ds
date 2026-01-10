import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MountOptions, MountResult } from './types/mount';

const mount = (el: HTMLElement, options: MountOptions = {}): MountResult => {
  const { onNavigate, initialPath } = options;

  const root = ReactDOM.createRoot(el);
  root.render(<App onNavigate={onNavigate} initialPath={initialPath} />);

  return {
    onParentNavigate({ pathname: nextPathname }: { pathname: string }) {
      // Navigation handled by React Router v6
    },
  };
};

if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#_marketing-dev-root');

  if (devRoot) {
    mount(devRoot as HTMLElement);
  }
}

export { mount };
