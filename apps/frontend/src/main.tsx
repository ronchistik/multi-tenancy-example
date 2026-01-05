/**
 * App entry point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { baseStyles } from './tenantUx';
import './index.css';

// Inject base styles
const styleSheet = document.createElement('style');
styleSheet.textContent = baseStyles;
document.head.appendChild(styleSheet);

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

