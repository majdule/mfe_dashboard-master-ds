import { mount } from 'auth/AuthApp';
import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthAppProps {
  onSignIn: () => void;
}

const AuthApp: React.FC<AuthAppProps> = ({ onSignIn }) => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ref.current) return;

    const { onParentNavigate } = mount(ref.current, {
      initialPath: location.pathname,
      onNavigate: ({ pathname: nextPathname }) => {
        const { pathname } = location;

        if (pathname !== nextPathname) {
          navigate(nextPathname);
        }
      },
      onSignIn,
    });

    // Notify the mounted auth microfrontend when the parent location changes
    onParentNavigate({ pathname: location.pathname });
  }, [location.pathname, navigate, onSignIn]);

  return <div ref={ref} />;
};

export default AuthApp;
