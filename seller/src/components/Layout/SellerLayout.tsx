import React, { ReactNode } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

interface SellerLayoutProps {
  children: ReactNode;
}

const SellerLayout = ({ children }: SellerLayoutProps) => {
  return (
    <div className="flex h-screen bg-white text-black font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
