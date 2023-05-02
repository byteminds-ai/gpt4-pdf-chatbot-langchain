import React from 'react';
import Head from 'next/head';
import LeftNavMenu from '../LeftNavMenu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Document Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 space-y-4">
            <LeftNavMenu />
          </div>
          <div className="col-span-3">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Layout;
