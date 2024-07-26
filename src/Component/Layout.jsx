import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Messenger from './Messenger';

export default function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
        <Messenger />
      </main>
      <Footer />
    </div>
  );
}
