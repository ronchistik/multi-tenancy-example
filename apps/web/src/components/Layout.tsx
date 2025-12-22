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
  return (
    <div style={styles.container}>
      <header style={{ ...styles.header, background: config.uxHints.primaryColor }}>
        <h1 style={styles.title}>{config.uxHints.brandName}</h1>
        <p style={styles.subtitle}>Multi-Tenant Travel Platform Demo</p>
      </header>
      <main style={styles.main}>{children}</main>
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

