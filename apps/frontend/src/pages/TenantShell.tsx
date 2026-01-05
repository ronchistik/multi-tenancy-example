/**
 * Tenant shell - loads config and renders appropriate pages
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createApiClient, type TenantConfig, type Location } from '../api';
import { Layout } from '../components/common/Layout';
import { FlightsPage } from './FlightsPage';
import { StaysPage } from './StaysPage';
import { PageRenderer } from './PageRenderer';
import { applyTenantTheme } from '../tenantUx';
import { loadPageConfig, loadTenantTheme } from '../utils/pageStorage';
import { applyThemeOverrides } from '../utils/themeUtils';

interface TenantShellProps {
  tenantId: string;
}

export function TenantShell({ tenantId }: TenantShellProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<'flights' | 'stays'>('flights');
  
  // Saved configs from database
  const [savedFlightsConfig, setSavedFlightsConfig] = useState<any>(null);
  const [tenantTheme, setTenantTheme] = useState<any>(null);

  const apiClient = createApiClient(tenantId);

  // Load saved configs from database
  useEffect(() => {
    // Reset on tenant change
    setSavedFlightsConfig(null);
    setTenantTheme(null);
    
    // Load from database
    Promise.all([
      loadPageConfig(tenantId, 'flights-page'),
      loadTenantTheme(tenantId),
    ]).then(([pageConfig, theme]) => {
      setSavedFlightsConfig(pageConfig);
      setTenantTheme(theme);
    }).catch(console.error);
  }, [tenantId]);

  useEffect(() => {
    loadConfigFromApi();
  }, [tenantId]);

  // Apply tenant-level theme overrides to config
  // Must be called unconditionally (React hooks rule)
  const effectiveConfig = useMemo(() => {
    if (!config) return null;
    if (tenantTheme) {
      return applyThemeOverrides(config, tenantTheme);
    }
    return config;
  }, [config, tenantTheme]);

  const loadConfigFromApi = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getConfig();
      setConfig(response.tenant);
      setLocations(response.locations);
      applyTenantTheme(response.tenant);

      // Set default tab to first enabled vertical
      if (response.tenant.enabledVerticals.includes('flights')) {
        setActiveTab('flights');
      } else if (response.tenant.enabledVerticals.includes('stays')) {
        setActiveTab('stays');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-base text-gray-600">Loading tenant configuration...</div>;
  }

  if (error || !config || !effectiveConfig) {
    return <div className="p-10 text-center text-base text-red-600">Error: {error || 'No config'}</div>;
  }

  const flightsEnabled = config.enabledVerticals.includes('flights');
  const staysEnabled = config.enabledVerticals.includes('stays');
  // Use saved config from database, or fall back to tenant default
  const flightsPageConfig = savedFlightsConfig || config.pages?.flights;

  // Hide FeatureCards in Layout when PageRenderer will render them
  const usePageRenderer = activeTab === 'flights' && flightsEnabled && flightsPageConfig;

  return (
    <Layout config={effectiveConfig} hideFeatureCards={!!usePageRenderer}>
      {/* Vertical tabs */}
      {flightsEnabled && staysEnabled && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab('flights')}
            className="px-6 py-3 text-base font-semibold rounded-lg transition-colors"
            style={{
              background: activeTab === 'flights' ? effectiveConfig.uxHints.primaryColor : '#f0f0f0',
              color: activeTab === 'flights' ? 'white' : '#666',
            }}
          >
            ✈️ Flights
          </button>
          <button
            onClick={() => setActiveTab('stays')}
            className="px-6 py-3 text-base font-semibold rounded-lg transition-colors"
            style={{
              background: activeTab === 'stays' ? effectiveConfig.uxHints.primaryColor : '#f0f0f0',
              color: activeTab === 'stays' ? 'white' : '#666',
            }}
          >
            🏨 Hotels
          </button>
        </div>
      )}

      {/* Vertical disabled message */}
      {!staysEnabled && activeTab === 'stays' && (
        <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-base text-yellow-800">
          Hotels are not available for {effectiveConfig.uxHints.brandName}
        </div>
      )}

      {/* Content */}
      {activeTab === 'flights' && flightsEnabled && (
        flightsPageConfig ? (
          <PageRenderer
            pageConfig={flightsPageConfig}
            config={effectiveConfig}
            onFlightSearch={(req) => apiClient.searchFlights(req)}
          />
        ) : (
        <FlightsPage
            config={effectiveConfig}
          onSearch={(req) => apiClient.searchFlights(req)}
        />
        )
      )}

      {activeTab === 'stays' && staysEnabled && (
        <StaysPage
          config={effectiveConfig}
          locations={locations}
          onSearch={(req) => apiClient.searchStays(req)}
        />
      )}
    </Layout>
  );
}


