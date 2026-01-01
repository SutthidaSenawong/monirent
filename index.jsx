import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./src/Component/Layout";
import Monitors from "./src/Monitors";
import MonitorsDetail from "./src/MonitorsDetail";
import Home from "./src/Component/Home";
import Cart from "./src/Cart";
import Checkout from "./src/Checkout";
import PurchaseOrdersPage from "./src/PurchaseOrders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='/rent-monitors-chiangmai' element={<Monitors />} />
          <Route
            path='/rent-monitors-chiangmai/:id'
            element={<MonitorsDetail />}
          />
          <Route path='/rent-monitors-chiangmai/cart' element={<Cart />} />
          <Route
            path='/rent-monitors-chiangmai/checkout'
            element={<Checkout />}
          />
        </Route>
        <Route path='/orders' element={<PurchaseOrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
