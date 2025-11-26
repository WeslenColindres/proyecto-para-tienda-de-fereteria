import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import 'uplot/dist/uPlot.min.css';
import './styles/tailwind.css';
import './styles/global.css';
import './styles/app.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/products.css';
import './styles/suppliers.css';
import './styles/customers.css';
import './styles/sales.css';
import './styles/theme-override.css';
import './styles/reports.css';
import './styles/users.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
