// src/main.tsx
import { registerSW } from 'virtual:pwa-register';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// تفعيل وتحديث الـ Service Worker تلقائياً
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('يتوفر تحديث جديد للتطبيق، هل تريد التحديث الآن؟')) {
      updateSW(true);
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);