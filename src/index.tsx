import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globals.css';
import SetupPage from './pages/setup-page';
import LoginPage from './pages/login-page';
import Dashboard from './pages/dashboard';
import Customers from './pages/customers';
import Stocks from './pages/stocks';
import Logs from './pages/logs';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
