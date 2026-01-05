/**
 * App root
 */

import React, { useState } from 'react';
import { TenantPicker } from './components/tenant/TenantPicker';
import { TenantShell } from './pages/TenantShell';
import { PageBuilder } from './pages/PageBuilder';
import { PageEditor } from './pages/PageEditor';
import { createApiClient } from './api';
import { savePageConfig, loadPageConfig, saveTenantTheme, loadTenantTheme } from './utils/pageStorage';

export function App() {
  const [tenantId, setTenantId] = useState<string>('saver-trips');
  const [showBuilder, setShowBuilder] = useState<boolean>(false);
  const [config, setConfig] = useState<any>(null);
  const [tenantName, setTenantName] = useState<string>('');
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [editorKey, setEditorKey] = useState<number>(0);
  const [savedPageConfig, setSavedPageConfig] = useState<any>(null);
  const [savedTheme, setSavedTheme] = useState<any>(null);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<boolean>(false);

  // ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  React.useEffect(() => {
    if (showBuilder) {
      setIsLoadingConfigs(true);
      
      // Load tenant config, saved page config, and theme in parallel
      Promise.all([
        createApiClient(tenantId).getConfig(),
        loadPageConfig(tenantId, 'flights-page'),
        loadTenantTheme(tenantId),
      ]).then(([tenantConfig, pageConfig, theme]) => {
        setConfig(tenantConfig);
        setSavedPageConfig(pageConfig);
        setSavedTheme(theme);
        setIsLoadingConfigs(false);
      }).catch((err) => {
        console.error('Failed to load configs:', err);
        setIsLoadingConfigs(false);
      });
    }
  }, [showBuilder, tenantId, editorKey]);
  
  React.useEffect(() => {
    createApiClient(tenantId).getConfig().then((res) => {
      setTenantName(res.tenant.uxHints.brandName);
    });
  }, [tenantId]);

  // Builder mode
  if (showBuilder && config && !isLoadingConfigs) {
    const apiClient = createApiClient(tenantId);
    
    // Use new PageEditor if flights page config exists, otherwise use old PageBuilder
    if (config.tenant.pages?.flights) {
      // Use saved config from database/localStorage, or fall back to tenant default
      const pageConfig = savedPageConfig || config.tenant.pages.flights;
      
      return (
        <PageEditor
          key={`editor-${tenantId}-${editorKey}`}
          pageConfig={pageConfig}
          config={config.tenant}
          initialThemeOverrides={savedTheme || undefined}
          onSave={async (serializedState, themeOverrides) => {
            try {
              // Save page layout to database
              await savePageConfig(tenantId, 'flights-page', serializedState);
              // Save theme at tenant level (applies to ALL pages for this tenant)
              if (themeOverrides && Object.keys(themeOverrides).length > 0) {
                await saveTenantTheme(tenantId, themeOverrides);
              }
              // Update local state immediately so it's reflected when closing
              // Must wrap in PageConfig object format (same as loadPageConfig returns)
              setSavedPageConfig({
                id: 'flights-page',
                name: 'Flights Page',
                serializedState: serializedState,
              });
              if (themeOverrides) {
                setSavedTheme(themeOverrides);
              }
              // Increment reload key so TenantShell will reload fresh when we close
              setReloadKey(prev => prev + 1);
              console.log('✅ Saved to database!', { serializedState, themeOverrides });
              alert('✅ Saved! Changes will be visible when you close the editor.');
            } catch (err) {
              console.error('❌ Save failed:', err);
              alert('❌ Failed to save to database.\n\nPlease check that the API server is running.');
            }
          }}
          onClose={() => {
            setShowBuilder(false);
            setConfig(null); // Clear config to force fresh load next time
            setSavedPageConfig(null);
            setSavedTheme(null);
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
        onNavigateToBuilder={() => {
          setEditorKey(prev => prev + 1); // Force fresh editor each time
          setShowBuilder(true);
        }}
      />
      <TenantShell key={`${tenantId}-${reloadKey}`} tenantId={tenantId} />
    </div>
  );
}

