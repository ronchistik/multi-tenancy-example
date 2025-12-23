/**
 * Flight Results Component
 * Craft.js compatible results display
 */

import React from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig, FlightOffer } from '../../api';
import type { FlightResultsProps } from '../../types/pageConfig';
import { FlightCards } from '../Flights/FlightCards';
import { FlightTable } from '../Flights/FlightTable';

interface FlightResultsRuntimeProps extends FlightResultsProps {
  config: TenantConfig;
  offers: FlightOffer[];
  error?: string | null;
  loading?: boolean;
  hasSearched?: boolean; // Only show empty message after a search was performed
}

export function FlightResults({ 
  title,
  emptyMessage = 'No flights found. Try a different search.',
  config, 
  offers,
  error,
  loading = false,
  hasSearched = false,
}: FlightResultsRuntimeProps) {
  const { connectors: { connect, drag } } = useNode();
  const tokens = config.uxHints.designTokens;
  const isTableLayout = config.uxHints.layout === 'table';

  return (
    <div ref={(ref) => ref && connect(drag(ref))}>
      {/* Error message */}
      {error && (
        <div style={{
          background: tokens.colors.errorBackground,
          color: tokens.colors.error,
          padding: '12px',
          borderRadius: tokens.borders.cardRadius,
          marginBottom: '20px',
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
        }}>
          Error: {error}
        </div>
      )}

      {/* Results */}
      {offers.length > 0 ? (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            fontFamily: tokens.typography.fontFamily,
            color: tokens.colors.textPrimary,
            marginBottom: '20px',
          }}>
            {title || (isTableLayout 
              ? `Results: ${offers.length} flight${offers.length !== 1 ? 's' : ''}`
              : `${offers.length} flight${offers.length !== 1 ? 's' : ''} found`
            )}
          </h3>
          {isTableLayout ? (
            <FlightTable offers={offers} config={config} />
          ) : (
            <FlightCards offers={offers} config={config} />
          )}
        </div>
      ) : null}
      
      {/* Empty message - only show after search completes with no results */}
      {hasSearched && offers.length === 0 && !error && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: tokens.colors.textSecondary,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
        }}>
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

// Craft.js settings
FlightResults.craft = {
  displayName: 'Flight Results',
  props: {
    title: '',
    emptyMessage: 'No flights found. Try a different search.',
  },
  related: {
    settings: FlightResultsSettings,
  },
  custom: {
    displayName: 'Flight Results',
  },
};

// Settings panel
function FlightResultsSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Title (optional)
        </label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((props: FlightResultsProps) => (props.title = e.target.value))}
          placeholder="Leave empty for default"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Empty Message
        </label>
        <input
          type="text"
          value={props.emptyMessage || ''}
          onChange={(e) => setProp((props: FlightResultsProps) => (props.emptyMessage = e.target.value))}
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

