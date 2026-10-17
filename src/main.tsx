import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Clean up any residual font-scale classes or localStorage keys
try {
  localStorage.removeItem('gocav_font_size');
  document.documentElement.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
} catch {
  // Ignore storage errors in restricted contexts
}

// Register PWA service worker immediately for installability & offline caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New GoCav update available');
  },
  onOfflineReady() {
    console.log('GoCav ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <App />
);
