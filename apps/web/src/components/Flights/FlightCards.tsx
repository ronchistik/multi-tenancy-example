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
  if (offers.length === 0) {
    return <p style={styles.empty}>No flights found</p>;
  }

  return (
    <div style={styles.grid}>
      {offers.map((offer) => (
        <div key={offer.id} style={styles.card}>
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
            fontSize: config.uxHints.priceEmphasis === 'high' ? '32px' : '24px',
            fontWeight: config.uxHints.priceEmphasis === 'high' ? 700 : 600,
          }}>
            {parseFloat(offer.price.amount).toFixed(0)} {offer.price.currency}
          </div>

          {/* Airline */}
          <div style={styles.airline}>{offer.owner.name}</div>

          {/* Route */}
          {offer.slices.map((slice, idx) => (
            <div key={idx} style={styles.slice}>
              <div style={styles.route}>
                <span style={styles.airport}>{slice.origin.code}</span>
                <span style={styles.arrow}>→</span>
                <span style={styles.airport}>{slice.destination.code}</span>
              </div>
              <div style={styles.time}>
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
            style={{ ...styles.button, background: config.uxHints.primaryColor }}
          >
            Select
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

