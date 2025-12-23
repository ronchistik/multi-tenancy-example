/**
 * Text Component
 * Basic text block for Craft.js
 */

import React from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig } from '../../api';

interface TextProps {
  text?: string;
  fontSize?: string;
  fontWeight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  config?: TenantConfig;
}

export function Text({ 
  text = 'Add your text here...',
  fontSize = '16px',
  fontWeight = 400,
  color,
  align = 'left',
  config,
}: TextProps) {
  const { connectors: { connect, drag } } = useNode();
  const tokens = config?.uxHints?.designTokens;

  return (
    <p
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        fontSize,
        fontWeight,
        color: color || tokens?.colors?.textPrimary || '#333',
        textAlign: align,
        fontFamily: tokens?.typography?.fontFamily || 'inherit',
        margin: 0,
        padding: '8px 0',
      }}
    >
      {text}
    </p>
  );
}

// Settings panel
function TextSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Text
        </label>
        <textarea
          value={props.text || ''}
          onChange={(e) => setProp((props: TextProps) => (props.text = e.target.value))}
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Font Size
        </label>
        <select
          value={props.fontSize || '16px'}
          onChange={(e) => setProp((props: TextProps) => (props.fontSize = e.target.value))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="12px">Small (12px)</option>
          <option value="14px">Normal (14px)</option>
          <option value="16px">Medium (16px)</option>
          <option value="18px">Large (18px)</option>
          <option value="24px">XL (24px)</option>
          <option value="32px">XXL (32px)</option>
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Font Weight
        </label>
        <select
          value={props.fontWeight || 400}
          onChange={(e) => setProp((props: TextProps) => (props.fontWeight = Number(e.target.value)))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value={300}>Light</option>
          <option value={400}>Normal</option>
          <option value={500}>Medium</option>
          <option value={600}>Semi Bold</option>
          <option value={700}>Bold</option>
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Text Color
        </label>
        <input
          type="color"
          value={props.color || '#333333'}
          onChange={(e) => setProp((props: TextProps) => (props.color = e.target.value))}
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
          Alignment
        </label>
        <select
          value={props.align || 'left'}
          onChange={(e) => setProp((props: TextProps) => (props.align = e.target.value as 'left' | 'center' | 'right'))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Add your text here...',
    fontSize: '16px',
    fontWeight: 400,
    align: 'left',
  },
  related: {
    settings: TextSettings,
  },
  custom: {
    displayName: 'Text',
  },
};

