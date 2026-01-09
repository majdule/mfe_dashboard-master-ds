import React from 'react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

import Landing from './components/Landing';
import Pricing from './components/Pricing';

const generateClassName = createGenerateClassName({
  productionPrefix: 'ma',
});

export default ({ initialPath }) => {
  return (
    <div style={{ border: '2px dashed #8d69eb' }}>
      <StylesProvider generateClassName={generateClassName}>
        <MemoryRouter initialEntries={[initialPath || '/']}>
          <Routes>
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/*" element={<Landing />} />
          </Routes>
        </MemoryRouter>
      </StylesProvider>
    </div>
  );
};
