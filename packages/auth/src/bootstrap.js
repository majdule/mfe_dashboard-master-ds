import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Exporting as a js function in order to remain frameworks agnostic
// Mount function takes in the refference of an html element and then display some content inside it
const mount = (el, { onSignIn, onNavigate, initialPath } = {}) => {
  const root = ReactDOM.createRoot(el);
  root.render(<App onSignIn={onSignIn} onNavigate={onNavigate} initialPath={initialPath} />);

  return {
    onParentNavigate({ pathname: nextPathname }) {
      // Navigation handled by React Router v6
    },
  };
};

if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#_auth-dev-root');

  if (devRoot) {
    mount(devRoot);
  }
}

export { mount };
