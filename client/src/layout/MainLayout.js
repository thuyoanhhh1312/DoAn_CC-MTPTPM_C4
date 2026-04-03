import React from 'react';
import MainFooter from './MainFooter';
import MainHeader from './MainHeader';

const MainLayout = ({ children }) => {
  return (
    <>
      <MainHeader />
      {children}
      <MainFooter />
    </>
  );
};

export default MainLayout;
