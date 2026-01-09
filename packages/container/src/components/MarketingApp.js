// For example this component would be provided
// by us in the documentation and imported on
// the MeasureOn side
import { mount } from 'marketing/MarketingApp';
import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default () => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { onParentNavigate } = mount(ref.current, {
      initialPath: location.pathname,
      onNavigate: ({ pathname: nextPathname }) => {
        const { pathname } = location;

        if (pathname !== nextPathname) {
          navigate(nextPathname);
        }
      },
    });

    // React Router v6 doesn't have history.listen, so we handle this differently
    // The navigation is handled through the navigate function
  }, [location.pathname]);

  return <div ref={ref} />;
};
