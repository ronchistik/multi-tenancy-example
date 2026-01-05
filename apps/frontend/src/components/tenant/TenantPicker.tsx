/**
 * Tenant picker component
 */

import React from 'react';
import { clearAllPageConfigs, clearAllTenantThemes } from '../../utils/pageStorage';

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

export function TenantPicker({ currentTenant, tenantName: _tenantName, onTenantChange, onNavigateToBuilder }: TenantPickerProps) {
  const handleReset = async () => {
    if (confirm('Reset all page and theme customizations for ALL tenants?\n\nThis will restore everything to default.')) {
      try {
        await clearAllPageConfigs();
        await clearAllTenantThemes();
        alert('✅ All customizations cleared! Refreshing page...');
        window.location.reload();
      } catch (err) {
        console.error('Reset failed:', err);
        alert('❌ Failed to reset. Make sure the API server is running.');
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Switch Tenant:</label>
        <select
          value={currentTenant}
          onChange={(e) => onTenantChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded"
        >
          {TENANTS.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-red-600"
          title="Reset all page customizations for all tenants"
        >
          🔄 Reset All
        </button>
      <button
        onClick={onNavigateToBuilder}
          className="px-4 py-2 bg-purple-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-purple-600"
      >
          🎨 Edit Page
      </button>
      </div>
    </div>
  );
}
