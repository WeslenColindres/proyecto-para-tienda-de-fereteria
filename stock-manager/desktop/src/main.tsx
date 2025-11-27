import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { AuthProvider } from './features/auth/context/AuthProvider';
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

// SEGURIDAD: Bloqueo de acceso vía navegador web estándar
// Verificamos si el objeto "desktop" está disponible en window (inyectado por preload)
const isElectron = typeof window !== 'undefined' && window.desktop !== undefined;

if (!isElectron) {
  ReactDOM.createRoot(rootElement).render(
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f43f5e' }}>Acceso Denegado</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Esta aplicación solo puede ejecutarse en el entorno de escritorio seguro.</p>
      <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.5 }}>Error: Entorno no autorizado (Browser)</p>
    </div>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}
