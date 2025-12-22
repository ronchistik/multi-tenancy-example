/**
 * Layout component
 */

import React from 'react';
import type { TenantConfig } from '../api';

interface LayoutProps {
  config: TenantConfig;
  children: React.ReactNode;
}

export function Layout({ config, children }: LayoutProps) {
  const isDark = config.uxHints.theme === 'dark';
  const isDense = config.uxHints.layout === 'table';
  const isPriceHigh = config.uxHints.priceEmphasis === 'high';
  const isPriceLow = config.uxHints.priceEmphasis === 'low';
  
  return (
    <div style={{
      ...styles.container,
      background: isDark ? '#1a1a1a' : isDense ? '#f8f9fa' : '#ffffff',
    }}>
      <header style={{ 
        ...styles.header, 
        background: config.uxHints.primaryColor,
        padding: isDense ? '12px 20px' : isPriceHigh ? '28px 20px' : '24px 20px',
        boxShadow: isDense ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      }}>
        <h1 style={{
          ...styles.title,
          fontSize: isPriceHigh ? '32px' : isPriceLow ? '28px' : '22px',
          fontWeight: isPriceHigh ? 700 : isPriceLow ? 300 : 600,
          letterSpacing: isPriceLow ? '2px' : 'normal',
          textTransform: isPriceLow ? 'uppercase' : 'none',
        }}>
          {config.uxHints.brandName}
        </h1>
        <p style={{
          ...styles.subtitle,
          fontSize: isPriceHigh ? '15px' : '14px',
          display: isDense ? 'none' : 'block',
        }}>
          {config.uxHints.tagline || 'Multi-Tenant Travel Platform Demo'}
        </p>
      </header>
      <main style={{
        ...styles.main,
        maxWidth: isDense ? '1600px' : '1200px',
        background: isDark ? '#1a1a1a' : 'transparent',
      }}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    color: 'white',
    padding: '20px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.9,
  },
  main: {
    flex: 1,
    padding: '20px',
  },
};

