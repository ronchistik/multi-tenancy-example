/**
 * App root
 */

import React, { useState } from 'react';
import { TenantPicker } from './components/TenantPicker';
import { TenantShell } from './pages/TenantShell';
import { PageBuilder } from './pages/PageBuilder';
import { PageEditor } from './pages/PageEditor';
import { createApiClient } from './api';
import { savePageConfig, loadPageConfig } from './utils/pageStorage';

export function App() {
  const [tenantId, setTenantId] = useState<string>('saver-trips');
  const [showBuilder, setShowBuilder] = useState<boolean>(false);
  const [config, setConfig] = useState<any>(null);
  const [tenantName, setTenantName] = useState<string>('');
  const [reloadKey, setReloadKey] = useState<number>(0);

  // ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  React.useEffect(() => {
    if (showBuilder) {
      // Load config and locations for page builder
      createApiClient(tenantId).getConfig().then((res) => {
        setConfig(res);
      });
    }
  }, [showBuilder, tenantId]);
  
  React.useEffect(() => {
    createApiClient(tenantId).getConfig().then((res) => {
      setTenantName(res.tenant.uxHints.brandName);
    });
  }, [tenantId]);

  // Builder mode
  if (showBuilder && config) {
    const apiClient = createApiClient(tenantId);
    
    // Use new PageEditor if flights page config exists, otherwise use old PageBuilder
    if (config.tenant.pages?.flights) {
      // Try to load saved config from localStorage first
      const savedConfig = loadPageConfig(tenantId, 'flights-page');
      const pageConfig = savedConfig || config.tenant.pages.flights;
      
      return (
        <PageEditor
          pageConfig={pageConfig}
          config={config.tenant}
          onSave={(serializedState, themeOverrides) => {
            savePageConfig(tenantId, 'flights-page', serializedState, themeOverrides);
            console.log('✅ Page saved to localStorage!', { serializedState, themeOverrides });
            alert('✅ Page saved successfully!\n\n(Currently saved to browser localStorage. In production, this would save to the backend API.)');
          }}
          onClose={() => {
            setShowBuilder(false);
            setReloadKey(prev => prev + 1); // Force reload of TenantShell
          }}
        />
      );
    }
    
    // Fallback to old page builder
    return (
      <div>
        <div style={{
          padding: '12px 20px',
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            🎨 Page Builder - {config.tenant?.uxHints?.brandName || 'Loading...'}
          </h2>
          <button
            onClick={() => setShowBuilder(false)}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Back to App
          </button>
        </div>
        <PageBuilder
          config={config.tenant}
          locations={config.locations}
          onFlightSearch={(req) => apiClient.searchFlights(req)}
          onStaySearch={(req) => apiClient.searchStays(req)}
        />
      </div>
    );
  }

  // Main app mode
  return (
    <div>
      <TenantPicker
        currentTenant={tenantId}
        tenantName={tenantName}
        onTenantChange={setTenantId}
        onNavigateToBuilder={() => setShowBuilder(true)}
      />
      <TenantShell key={`${tenantId}-${reloadKey}`} tenantId={tenantId} />
    </div>
  );
}

