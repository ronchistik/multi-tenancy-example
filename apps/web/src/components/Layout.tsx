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
  const isBudget = config.id === 'saver-trips';
  const isLuxury = config.id === 'apex-reserve';
  const isCorporate = config.id === 'globex-systems';
  
  return (
    <div style={{
      ...styles.container,
      background: isLuxury ? '#1a1a1a' : isCorporate ? '#f8f9fa' : '#ffffff',
    }}>
      <header style={{ 
        ...styles.header, 
        background: config.uxHints.primaryColor,
        padding: isCorporate ? '12px 20px' : isBudget ? '28px 20px' : '24px 20px',
        boxShadow: isCorporate ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      }}>
        <h1 style={{
          ...styles.title,
          fontSize: isBudget ? '32px' : isLuxury ? '28px' : '22px',
          fontWeight: isBudget ? 700 : isLuxury ? 300 : 600,
          letterSpacing: isLuxury ? '2px' : 'normal',
          textTransform: isLuxury ? 'uppercase' : 'none',
        }}>
          {config.uxHints.brandName}
        </h1>
        <p style={{
          ...styles.subtitle,
          fontSize: isBudget ? '15px' : '14px',
          display: isCorporate ? 'none' : 'block',
        }}>
          {isBudget ? 'Budget-Friendly Student Travel' : 
           isLuxury ? 'Curated Luxury Travel' : 
           'Multi-Tenant Travel Platform Demo'}
        </p>
      </header>
      <main style={{
        ...styles.main,
        maxWidth: isCorporate ? '1600px' : '1200px',
        background: isLuxury ? '#1a1a1a' : 'transparent',
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

