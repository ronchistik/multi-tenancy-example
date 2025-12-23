/**
 * Page Title Component
 * Craft.js compatible title/heading component
 */

import React from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig } from '../../api';
import type { PageTitleProps } from '../../types/pageConfig';

interface PageTitleRuntimeProps extends PageTitleProps {
  config: TenantConfig;
}

export function PageTitle({ text, align = 'left', config }: PageTitleRuntimeProps) {
  const { connectors: { connect, drag } } = useNode();
  const tokens = config.uxHints.designTokens;

  // Use provided text or generate from config
  const titleText = text || (
    config.uxHints.priceEmphasis === 'low' 
      ? 'Search Premium Flights' 
      : 'Search Flights'
  );

  return (
    <h2
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        fontSize: tokens.typography.headingSize,
        fontWeight: tokens.typography.headingWeight,
        fontFamily: tokens.typography.fontFamily,
        color: tokens.colors.textPrimary,
        marginBottom: '20px',
        textAlign: align,
      }}
    >
      {titleText}
    </h2>
  );
}

// Craft.js settings
PageTitle.craft = {
  displayName: 'Page Title',
  props: {
    text: '',
    align: 'left',
  },
  related: {
    settings: PageTitleSettings,
  },
  custom: {
    displayName: 'Page Title',
  },
};

// Settings panel for Craft.js editor
function PageTitleSettings() {
  const { actions: { setProp }, props, config } = useNode((node) => ({
    props: node.data.props,
    config: node.data.props.config,
  }));

  // Calculate what's actually showing
  const actualText = props.text || (
    config?.uxHints?.priceEmphasis === 'low' 
      ? 'Search Premium Flights' 
      : 'Search Flights'
  );

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Title Text
        </label>
        <input
          type="text"
          value={props.text || ''}
          onChange={(e) => setProp((props: PageTitleProps) => (props.text = e.target.value))}
          placeholder="Leave empty for default"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        {!props.text && (
          <div style={{ 
            fontSize: '11px', 
            color: '#6b7280', 
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            Currently showing: "{actualText}"
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Alignment
        </label>
        <select
          value={props.align || 'left'}
          onChange={(e) => setProp((props: PageTitleProps) => (props.align = e.target.value as any))}
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

