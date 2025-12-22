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
  const tokens = config.uxHints.designTokens;
  const isDense = config.uxHints.layout === 'table';
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: tokens.colors.background,
      fontFamily: tokens.typography.fontFamily,
      color: tokens.colors.textPrimary,
    }}>
      <header style={{ 
        color: 'white',
        padding: isDense ? '12px 20px' : '28px 20px',
        textAlign: 'center',
        background: config.uxHints.primaryColor,
        boxShadow: isDense ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      }}>
        <h1 style={{
          fontSize: tokens.typography.headingSize,
          fontWeight: tokens.typography.headingWeight,
          marginBottom: '4px',
          letterSpacing: config.uxHints.priceEmphasis === 'low' ? '2px' : 'normal',
          textTransform: config.uxHints.priceEmphasis === 'low' ? 'uppercase' : 'none',
        }}>
          {config.uxHints.brandName}
        </h1>
        <p style={{
          fontSize: tokens.typography.bodySize,
          opacity: 0.9,
          display: isDense ? 'none' : 'block',
        }}>
          {config.uxHints.tagline || 'Multi-Tenant Travel Platform Demo'}
        </p>
      </header>
      <main style={{
        flex: 1,
        padding: '20px',
        maxWidth: isDense ? '1600px' : '1200px',
        margin: '0 auto',
        width: '100%',
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

