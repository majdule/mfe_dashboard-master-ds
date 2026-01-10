import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';

import Header from './components/Header';
import Progress from './components/Progress';

// Importing components that are created on the MEAS side
const AuthLazy = lazy(() => import('./components/AuthApp'));
const MarketingLazy = lazy(() => import('./components/MarketingApp'));
const DashboardLazy = lazy(() => import('./components/DashboardApp'));

const generateClassName = createGenerateClassName({
  productionPrefix: 'co',
});

const AppContent: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const prevIsSignedIn = useRef<boolean>(false);

  useEffect(() => {
    // Only navigate to dashboard when user just signed in (changed from false to true)
    if (isSignedIn && !prevIsSignedIn.current) {
      navigate('/dashboard');
    }
    prevIsSignedIn.current = isSignedIn;
  }, [isSignedIn, navigate]);

  return (
    <StylesProvider generateClassName={generateClassName}>
      <div>
        <Header onSignOut={() => setIsSignedIn(false)} isSignedIn={isSignedIn} />
        <Suspense fallback={<Progress />}>
          <Routes>
            {/* Job of a container app (ex. MEAS) would be to select which
            microfrontend would be displayed on a certain routes */}
            <Route path="/auth/*" element={<AuthLazy onSignIn={() => setIsSignedIn(true)} />} />
            <Route
              path="/dashboard/*"
              element={!isSignedIn ? <Navigate to="/" replace /> : <DashboardLazy />}
            />
            <Route path="/*" element={<MarketingLazy />} />
          </Routes>
        </Suspense>
      </div>
    </StylesProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
