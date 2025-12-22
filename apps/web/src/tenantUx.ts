/**
 * Tenant UX theming utilities
 */

import type { TenantConfig } from './api';

export function applyTenantTheme(config: TenantConfig): void {
  document.documentElement.style.setProperty('--primary-color', config.uxHints.primaryColor);
  document.title = config.uxHints.brandName;
}

export function getTenantStyles(config: TenantConfig): React.CSSProperties {
  return {
    '--primary-color': config.uxHints.primaryColor,
  } as React.CSSProperties;
}

export const baseStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f5f5;
    color: #333;
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  input, select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
  }

  input:focus, select:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

