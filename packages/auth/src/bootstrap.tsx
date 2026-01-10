import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MountOptions, MountResult } from './types/mount';

const mount = (el: HTMLElement, options: MountOptions = {}): MountResult => {
  const { onSignIn, onNavigate, initialPath } = options;

  const root = ReactDOM.createRoot(el);
  root.render(<App onSignIn={onSignIn} onNavigate={onNavigate} initialPath={initialPath} />);

  return {
    onParentNavigate({ pathname: nextPathname }: { pathname: string }) {
      // Navigation handled by React Router v6
    },
  };
};

if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#_auth-dev-root');

  if (devRoot) {
    mount(devRoot as HTMLElement);
  }
}

export { mount };
