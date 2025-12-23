/**
 * Container Component
 * Generic container for other components
 */

import React from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig } from '../../api';

interface ContainerProps {
  children?: React.ReactNode;
  padding?: string;
  config?: TenantConfig;
}

export function Container({ children, padding = '0', config }: ContainerProps) {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div 
      ref={(ref) => ref && connect(drag(ref))}
      style={{ 
        padding,
        fontFamily: config?.uxHints.designTokens.typography.fontFamily,
      }}
    >
      {children}
    </div>
  );
}

// Craft.js settings
Container.craft = {
  displayName: 'Container',
  props: {
    padding: '0',
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canMoveIn: () => true, // Can accept any child
  },
  custom: {
    displayName: 'Container',
  },
};

// Settings panel
function ContainerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div style={{ padding: '10px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Padding
        </label>
        <input
          type="text"
          value={props.padding || '0'}
          onChange={(e) => setProp((props: ContainerProps) => (props.padding = e.target.value))}
          placeholder="e.g., 20px or 1rem"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
}

