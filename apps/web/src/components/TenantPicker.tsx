/**
 * Tenant picker component
 */

import React from 'react';

const TENANTS = [
  { id: 'saver-trips', name: 'SaverTrips (Student Budget App)' },
  { id: 'apex-reserve', name: 'Apex Reserve (Luxury Concierge)' },
  { id: 'globex-systems', name: 'Globex Systems (Corporate Travel)' },
];

interface TenantPickerProps {
  currentTenant: string;
  onTenantChange: (tenantId: string) => void;
}

export function TenantPicker({ currentTenant, onTenantChange }: TenantPickerProps) {
  return (
    <div style={styles.container}>
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
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
};

