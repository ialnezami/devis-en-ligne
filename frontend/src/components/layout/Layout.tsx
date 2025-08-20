import React from 'react';
import MainLayout from '../layout/MainLayout/MainLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

export default Layout;
