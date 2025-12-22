/**
 * Flight cards layout (for card-based UX)
 */

import React from 'react';
import type { FlightOffer, TenantConfig } from '../../api';

interface FlightCardsProps {
  offers: FlightOffer[];
  config: TenantConfig;
}

export function FlightCards({ offers, config }: FlightCardsProps) {
  const tokens = config.uxHints.designTokens;

  if (offers.length === 0) {
    return <p style={{
      textAlign: 'center',
      padding: '40px',
      color: tokens.colors.textSecondary,
    }}>No flights found</p>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: tokens.spacing.cardGap,
    }}>
      {offers.map((offer) => (
        <div key={offer.id} style={{
          background: tokens.colors.cardBackground,
          padding: tokens.spacing.cardPadding,
          borderRadius: tokens.borders.cardRadius,
          boxShadow: tokens.shadows.card,
          position: 'relative',
          border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
        }}>
          {/* Policy badges */}
          {offer.policy?.preferred && config.uxHints.highlightPreferred && (
            <div style={styles.preferredBadge}>✓ Preferred</div>
          )}
          
          {/* Promotional badges */}
          {offer.policy?.promotions && offer.policy.promotions.map((promo, idx) => (
            <div key={idx} style={styles.promoBadge}>
              ✨ {promo.message}
            </div>
          ))}
          
          {/* Price */}
          <div style={{
            fontSize: tokens.typography.priceSize,
            fontWeight: tokens.typography.priceWeight,
            color: config.uxHints.priceEmphasis === 'high' ? config.uxHints.primaryColor : tokens.colors.textPrimary,
            marginBottom: '8px',
            textAlign: config.uxHints.priceEmphasis === 'high' ? 'center' : 'left',
          }}>
            ${parseFloat(offer.price.amount).toFixed(0)}
            <span style={{
              fontSize: tokens.typography.bodySize,
              fontWeight: tokens.typography.bodyWeight,
              color: tokens.colors.textSecondary,
              display: config.uxHints.priceEmphasis === 'high' ? 'block' : 'inline',
              marginTop: config.uxHints.priceEmphasis === 'high' ? '4px' : '0',
              marginLeft: config.uxHints.priceEmphasis === 'high' ? '0' : '4px',
            }}>
              {offer.price.currency}
            </span>
          </div>

          {/* Airline */}
          <div style={{
            fontSize: tokens.typography.bodySize,
            fontWeight: tokens.typography.bodyWeight,
            fontFamily: tokens.typography.fontFamily,
            color: tokens.colors.textSecondary,
            textAlign: config.uxHints.priceEmphasis === 'high' ? 'center' : 'left',
            marginBottom: '12px',
          }}>{offer.owner.name}</div>

          {/* Route */}
          {offer.slices.map((slice, idx) => (
            <div key={idx} style={{
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid ' + tokens.colors.border,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: tokens.colors.textPrimary,
                }}>{slice.origin.code}</span>
                <span style={{
                  color: tokens.colors.textSecondary,
                  fontSize: '14px',
                }}>→</span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: tokens.colors.textPrimary,
                }}>{slice.destination.code}</span>
              </div>
              <div style={{
                fontSize: tokens.typography.bodySize,
                color: tokens.colors.textSecondary,
              }}>
                {new Date(slice.departureTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {new Date(slice.arrivalTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}

          {/* Policy warnings */}
          {config.uxHints.showPolicyCompliance &&
            offer.policy?.violations.map((v, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.violation,
                  background: v.severity === 'error' ? '#fee' : v.severity === 'info' ? '#e0f2fe' : '#fff3cd',
                  color: v.severity === 'error' ? '#c00' : v.severity === 'info' ? '#0369a1' : '#856404',
                }}
              >
                {v.severity === 'error' ? '🚫' : v.severity === 'info' ? 'ℹ️' : '⚠️'} {v.message}
              </div>
            ))}

          <button
            style={{ 
              width: '100%',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              marginTop: '12px',
              background: config.uxHints.primaryColor,
              color: 'white',
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.buttonSize,
              fontWeight: tokens.typography.buttonWeight,
              padding: tokens.spacing.buttonPadding,
              borderRadius: tokens.borders.buttonRadius,
              textTransform: config.uxHints.priceEmphasis === 'low' ? 'uppercase' : 'none',
              letterSpacing: config.uxHints.priceEmphasis === 'low' ? '1px' : 'normal',
            }}
          >
            {config.uxHints.buttonLabels?.selectFlight || 'Select'}
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative' as const,
  },
  preferredBadge: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    background: '#10b981',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  promoBadge: {
    position: 'absolute' as const,
    top: '40px',
    right: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  price: {
    color: '#333',
    marginBottom: '8px',
  },
  airline: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#666',
    marginBottom: '12px',
  },
  slice: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f0f0f0',
  },
  route: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  airport: {
    fontSize: '18px',
    fontWeight: 600,
  },
  arrow: {
    color: '#999',
    fontSize: '14px',
  },
  time: {
    fontSize: '14px',
    color: '#666',
  },
  violation: {
    padding: '8px',
    borderRadius: '6px',
    fontSize: '12px',
    marginTop: '10px',
  },
  button: {
    width: '100%',
    color: 'white',
    marginTop: '12px',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#999',
  },
};

