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
  const isDark = config.uxHints.theme === 'dark';
  const isPriceHigh = config.uxHints.priceEmphasis === 'high';
  const isPriceLow = config.uxHints.priceEmphasis === 'low';

  if (offers.length === 0) {
    return <p style={{
      ...styles.empty,
      color: isDark ? '#888' : '#999',
    }}>No flights found</p>;
  }

  return (
    <div style={{
      ...styles.grid,
      gridTemplateColumns: isPriceHigh ? 'repeat(auto-fill, minmax(340px, 1fr))' : 
                          isPriceLow ? 'repeat(auto-fill, minmax(400px, 1fr))' :
                          'repeat(auto-fill, minmax(320px, 1fr))',
      gap: isPriceHigh ? '24px' : isPriceLow ? '32px' : '20px',
    }}>
      {offers.map((offer) => (
        <div key={offer.id} style={{
          ...styles.card,
          background: isDark ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' : 'white',
          border: isDark ? '1px solid #3a3a3a' : isPriceHigh ? '2px solid #e5e7eb' : 'none',
          borderRadius: isPriceHigh ? '20px' : '12px',
          padding: isPriceHigh ? '28px' : isPriceLow ? '32px' : '20px',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.6)' : 
                     isPriceHigh ? '0 2px 8px rgba(16, 185, 129, 0.1)' :
                     '0 2px 8px rgba(0,0,0,0.1)',
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
          
          {/* Price - prominent for budget tenants */}
          <div style={{
            ...styles.price,
            fontSize: isPriceHigh ? '48px' : isPriceLow ? '32px' : '24px',
            fontWeight: isPriceHigh ? 800 : isPriceLow ? 300 : 600,
            color: isPriceHigh ? config.uxHints.primaryColor : isDark ? '#ffffff' : '#333',
            marginBottom: '8px',
            textAlign: isPriceHigh ? 'center' : 'left',
          }}>
            ${parseFloat(offer.price.amount).toFixed(0)}
            <span style={{
              fontSize: isPriceHigh ? '20px' : '18px',
              fontWeight: 400,
              color: isDark ? '#999' : '#666',
              display: isPriceHigh ? 'block' : 'inline',
              marginTop: isPriceHigh ? '4px' : '0',
              marginLeft: isPriceHigh ? '0' : '4px',
            }}>
              {offer.price.currency}
            </span>
          </div>

          {/* Airline */}
          <div style={{
            ...styles.airline,
            color: isDark ? '#b0b0b0' : '#666',
            fontSize: isPriceLow ? '18px' : '16px',
            fontWeight: isPriceLow ? 400 : 500,
            textAlign: isPriceHigh ? 'center' : 'left',
            marginBottom: isPriceHigh ? '16px' : '12px',
          }}>{offer.owner.name}</div>

          {/* Route */}
          {offer.slices.map((slice, idx) => (
            <div key={idx} style={{
              ...styles.slice,
              borderBottom: isDark ? '1px solid #3a3a3a' : '1px solid #f0f0f0',
            }}>
              <div style={styles.route}>
                <span style={{
                  ...styles.airport,
                  color: isDark ? '#e5e5e5' : '#333',
                  fontSize: isPriceHigh ? '20px' : '18px',
                }}>{slice.origin.code}</span>
                <span style={{
                  ...styles.arrow,
                  color: isDark ? '#666' : '#999',
                }}>→</span>
                <span style={{
                  ...styles.airport,
                  color: isDark ? '#e5e5e5' : '#333',
                  fontSize: isPriceHigh ? '20px' : '18px',
                }}>{slice.destination.code}</span>
              </div>
              <div style={{
                ...styles.time,
                color: isDark ? '#999' : '#666',
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
              ...styles.button, 
              background: config.uxHints.primaryColor,
              fontSize: isPriceHigh ? '18px' : '14px',
              fontWeight: isPriceHigh ? 700 : 500,
              padding: isPriceHigh ? '16px' : '10px 20px',
              textTransform: isDark ? 'uppercase' : 'none',
              letterSpacing: isDark ? '1px' : 'normal',
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

