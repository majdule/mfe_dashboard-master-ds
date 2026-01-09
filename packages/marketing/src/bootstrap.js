import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mount = (el, { onNavigate, initialPath } = {}) => {
  const root = ReactDOM.createRoot(el);
  root.render(<App onNavigate={onNavigate} initialPath={initialPath} />);

  return {
    onParentNavigate({ pathname: nextPathname }) {
      // Navigation handled by React Router v6
    },
  };
};

if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#_marketing-dev-root');

  if (devRoot) {
    mount(devRoot);
  }
}
export { mount };
