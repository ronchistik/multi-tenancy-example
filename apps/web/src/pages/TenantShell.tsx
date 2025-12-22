/**
 * Tenant shell - loads config and renders appropriate pages
 */

import React, { useState, useEffect } from 'react';
import { createApiClient, type TenantConfig, type Location } from '../api';
import { Layout } from '../components/Layout';
import { FlightsPage } from './FlightsPage';
import { StaysPage } from './StaysPage';
import { applyTenantTheme } from '../tenantUx';

interface TenantShellProps {
  tenantId: string;
}

export function TenantShell({ tenantId }: TenantShellProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<'flights' | 'stays'>('flights');

  const apiClient = createApiClient(tenantId);

  useEffect(() => {
    loadConfig();
  }, [tenantId]);

  const loadConfig = async () => {
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
    return <div style={styles.loading}>Loading tenant configuration...</div>;
  }

  if (error || !config) {
    return <div style={styles.error}>Error: {error || 'No config'}</div>;
  }

  const flightsEnabled = config.enabledVerticals.includes('flights');
  const staysEnabled = config.enabledVerticals.includes('stays');

  return (
    <Layout config={config}>
      {/* Vertical tabs */}
      {flightsEnabled && staysEnabled && (
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('flights')}
            style={{
              ...styles.tab,
              background: activeTab === 'flights' ? config.uxHints.primaryColor : '#f0f0f0',
              color: activeTab === 'flights' ? 'white' : '#666',
            }}
          >
            ✈️ Flights
          </button>
          <button
            onClick={() => setActiveTab('stays')}
            style={{
              ...styles.tab,
              background: activeTab === 'stays' ? config.uxHints.primaryColor : '#f0f0f0',
              color: activeTab === 'stays' ? 'white' : '#666',
            }}
          >
            🏨 Hotels
          </button>
        </div>
      )}

      {/* Vertical disabled message */}
      {!staysEnabled && activeTab === 'stays' && (
        <div style={styles.disabledMessage}>
          Hotels are not available for {config.uxHints.brandName}
        </div>
      )}

      {/* Content */}
      {activeTab === 'flights' && flightsEnabled && (
        <FlightsPage
          config={config}
          onSearch={(req) => apiClient.searchFlights(req)}
        />
      )}

      {activeTab === 'stays' && staysEnabled && (
        <StaysPage
          config={config}
          locations={locations}
          onSearch={(req) => apiClient.searchStays(req)}
        />
      )}
    </Layout>
  );
}

const styles = {
  loading: {
    padding: '40px',
    textAlign: 'center' as const,
    fontSize: '16px',
    color: '#666',
  },
  error: {
    padding: '40px',
    textAlign: 'center' as const,
    fontSize: '16px',
    color: '#c00',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '8px',
  },
  disabledMessage: {
    padding: '20px',
    background: '#ffe',
    border: '1px solid #dd6',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontSize: '16px',
    color: '#886',
  },
};

