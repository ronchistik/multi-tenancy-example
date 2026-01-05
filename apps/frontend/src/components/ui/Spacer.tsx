/**
 * Spacer Component
 * Adds vertical space between elements
 */

import React from 'react';
import { useNode } from '@craftjs/core';

interface SpacerProps {
  height?: string;
}

export function Spacer({ 
  height = '40px',
}: SpacerProps) {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        height,
        width: '100%',
        background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.03) 5px, rgba(0,0,0,0.03) 10px)',
        borderRadius: '4px',
      }}
    />
  );
}

// Settings panel
function SpacerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div style={{ padding: '10px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Height
        </label>
        <select
          value={props.height || '40px'}
          onChange={(e) => setProp((props: SpacerProps) => (props.height = e.target.value))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="10px">XS (10px)</option>
          <option value="20px">Small (20px)</option>
          <option value="40px">Medium (40px)</option>
          <option value="60px">Large (60px)</option>
          <option value="80px">XL (80px)</option>
          <option value="120px">XXL (120px)</option>
        </select>
      </div>
    </div>
  );
}

Spacer.craft = {
  displayName: 'Spacer',
  props: {
    height: '40px',
  },
  related: {
    settings: SpacerSettings,
  },
  custom: {
    displayName: 'Spacer',
  },
};

