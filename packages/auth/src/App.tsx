import React from 'react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

import Signin from './components/Signin';
import Signup from './components/Signup';

const generateClassName = createGenerateClassName({
  productionPrefix: 'au',
});

interface AppProps {
  onSignIn?: () => void;
  initialPath?: string;
  onNavigate?: (options: { pathname: string }) => void;
}

const App: React.FC<AppProps> = ({ onSignIn, initialPath }) => {
  return (
    <div style={{ border: '2px dashed #40e67c' }}>
      <StylesProvider generateClassName={generateClassName}>
        <MemoryRouter initialEntries={[initialPath || '/auth/signin']}>
          <Routes>
            <Route path="/auth/signin" element={<Signin onSignIn={onSignIn} />} />
            <Route path="/auth/signup" element={<Signup onSignIn={onSignIn} />} />
          </Routes>
        </MemoryRouter>
      </StylesProvider>
    </div>
  );
};

export default App;
