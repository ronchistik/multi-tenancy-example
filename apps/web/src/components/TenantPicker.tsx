/**
 * Tenant picker component
 */

import React from 'react';
import { clearAllPageConfigs } from '../utils/pageStorage';

const TENANTS = [
  { id: 'saver-trips', name: 'SaverTrips (Student Budget App)' },
  { id: 'apex-reserve', name: 'Apex Reserve (Luxury Concierge)' },
  { id: 'globex-systems', name: 'Globex Systems (Corporate Travel)' },
];

interface TenantPickerProps {
  currentTenant: string;
  tenantName?: string;
  onTenantChange: (tenantId: string) => void;
  onNavigateToBuilder: () => void;
}

export function TenantPicker({ currentTenant, tenantName, onTenantChange, onNavigateToBuilder }: TenantPickerProps) {
  const handleReset = () => {
    if (confirm('Reset all page customizations for ALL tenants?\n\nThis will restore all pages to their default state.')) {
      clearAllPageConfigs();
      alert('✅ All customizations cleared! Refreshing page...');
      window.location.reload();
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={styles.label}>Switch Tenant:</label>
        <select
          value={currentTenant}
          onChange={(e) => onTenantChange(e.target.value)}
          style={styles.select}
        >
          {TENANTS.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={handleReset}
          style={styles.resetButton}
          title="Reset all page customizations for all tenants"
        >
          🔄 Reset All
        </button>
        <button
          onClick={onNavigateToBuilder}
          style={styles.builderButton}
        >
          🎨 Edit Page
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: 'white',
    borderBottom: '1px solid #e0e0e0',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
  },
  select: {
    padding: '6px 12px',
    fontSize: '14px',
  },
  builderButton: {
    padding: '8px 16px',
    background: '#8B5CF6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resetButton: {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

