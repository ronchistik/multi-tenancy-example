/**
 * App root
 */

import React, { useState } from 'react';
import { TenantPicker } from './components/TenantPicker';
import { TenantShell } from './pages/TenantShell';

export function App() {
  const [tenantId, setTenantId] = useState<string>('saver-trips');

  return (
    <div>
      <TenantPicker currentTenant={tenantId} onTenantChange={setTenantId} />
      <TenantShell key={tenantId} tenantId={tenantId} />
    </div>
  );
}

