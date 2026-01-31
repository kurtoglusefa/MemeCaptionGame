import React from 'react';
import AppHeader from './AppHeader.jsx';
import AppFooter from './AppFooter.jsx';

const AppLayout = ({ children }) => (
  <div className="app-shell">
    <AppHeader />
    <main className="app-main">
      <div className="container">{children}</div>
    </main>
    <AppFooter />
  </div>
);

export default AppLayout;
