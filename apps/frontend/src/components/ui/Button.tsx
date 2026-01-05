/**
 * Button Component
 * Basic button for Craft.js
 */

import React from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig } from '../../api';

interface ButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  config?: TenantConfig;
}

export function Button({ 
  text = 'Click me',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  config,
}: ButtonProps) {
  const { connectors: { connect, drag } } = useNode();
  const tokens = config?.uxHints?.designTokens;
  const primaryColor = config?.uxHints?.primaryColor || '#3b82f6';

  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '12px' },
    medium: { padding: '10px 20px', fontSize: '14px' },
    large: { padding: '14px 28px', fontSize: '16px' },
  };

  const variantStyles = {
    primary: {
      background: primaryColor,
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: tokens?.colors?.cardBackground || '#f3f4f6',
      color: tokens?.colors?.textPrimary || '#333',
      border: `1px solid ${tokens?.colors?.border || '#ddd'}`,
    },
    outline: {
      background: 'transparent',
      color: primaryColor,
      border: `2px solid ${primaryColor}`,
    },
  };

  return (
    <button
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        borderRadius: tokens?.borders?.buttonRadius || '6px',
        fontFamily: tokens?.typography?.fontFamily || 'inherit',
        fontWeight: 600,
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s',
      }}
      onClick={(e) => e.preventDefault()}
    >
      {text}
    </button>
  );
}

// Settings panel
function ButtonSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Button Text
        </label>
        <input
          type="text"
          value={props.text || ''}
          onChange={(e) => setProp((props: ButtonProps) => (props.text = e.target.value))}
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
          Variant
        </label>
        <select
          value={props.variant || 'primary'}
          onChange={(e) => setProp((props: ButtonProps) => (props.variant = e.target.value as 'primary' | 'secondary' | 'outline'))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Size
        </label>
        <select
          value={props.size || 'medium'}
          onChange={(e) => setProp((props: ButtonProps) => (props.size = e.target.value as 'small' | 'medium' | 'large'))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={props.fullWidth || false}
            onChange={(e) => setProp((props: ButtonProps) => (props.fullWidth = e.target.checked))}
          />
          Full Width
        </label>
      </div>
    </div>
  );
}

Button.craft = {
  displayName: 'Button',
  props: {
    text: 'Click me',
    variant: 'primary',
    size: 'medium',
    fullWidth: false,
  },
  related: {
    settings: ButtonSettings,
  },
  custom: {
    displayName: 'Button',
  },
};

