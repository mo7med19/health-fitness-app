import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // تأكد من أن ملف Tailwind CSS مستورد هنا

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);