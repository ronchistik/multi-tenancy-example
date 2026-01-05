/**
 * Divider Component
 * Horizontal line separator for Craft.js
 */

import React from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig } from '../../api';

interface DividerProps {
  thickness?: number;
  color?: string;
  margin?: string;
  config?: TenantConfig;
}

export function Divider({ 
  thickness = 1,
  color,
  margin = '20px',
  config,
}: DividerProps) {
  const { connectors: { connect, drag } } = useNode();
  const tokens = config?.uxHints?.designTokens;

  return (
    <hr
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        border: 'none',
        borderTop: `${thickness}px solid ${color || tokens?.colors?.border || '#e0e0e0'}`,
        margin: `${margin} 0`,
      }}
    />
  );
}

// Settings panel
function DividerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Thickness (px)
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={props.thickness || 1}
          onChange={(e) => setProp((props: DividerProps) => (props.thickness = Number(e.target.value)))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Color
        </label>
        <input
          type="color"
          value={props.color || '#e0e0e0'}
          onChange={(e) => setProp((props: DividerProps) => (props.color = e.target.value))}
          style={{
            width: '100%',
            height: '36px',
            padding: '2px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Vertical Margin
        </label>
        <select
          value={props.margin || '20px'}
          onChange={(e) => setProp((props: DividerProps) => (props.margin = e.target.value))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="10px">Small (10px)</option>
          <option value="20px">Medium (20px)</option>
          <option value="40px">Large (40px)</option>
          <option value="60px">XL (60px)</option>
        </select>
      </div>
    </div>
  );
}

Divider.craft = {
  displayName: 'Divider',
  props: {
    thickness: 1,
    margin: '20px',
  },
  related: {
    settings: DividerSettings,
  },
  custom: {
    displayName: 'Divider',
  },
};

