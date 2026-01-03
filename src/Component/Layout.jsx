import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isCartPage = location.pathname === '/rent-monitors-chiangmai/cart';

  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      {!isCartPage && <Footer />}
    </div>
  );
}
