import { mount } from 'dashboard/DashboardApp';
import React, { useRef, useEffect } from 'react';

const DashboardApp: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      console.error('DashboardApp: ref.current is null');
      return;
    }

    const { unmount } = mount(ref.current);

    return () => {
      if (unmount) {
        unmount();
      }
    };
  }, []);

  return <div ref={ref} />;
};

export default DashboardApp;
