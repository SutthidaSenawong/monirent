import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './src/Component/Layout';
import Monitors from './src/Monitors';
import MonitorsDetail from './src/MonitorsDetail';
// import Home from './src/Component/Home';
// import './server';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Monitors />} />
          <Route path="/rent-monitors-chiangmai" element={<Monitors />} />
          <Route path="/monitors" element={<Monitors />} />
          <Route path="/monitors/:id" element={<MonitorsDetail />} />
          <Route
            path="/rent-monitors-chiangmai/:id"
            element={<MonitorsDetail />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
