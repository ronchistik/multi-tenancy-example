/**
 * Stay cards layout
 */

import React from 'react';
import type { StayOffer, TenantConfig } from '../../api';

interface StayCardsProps {
  stays: StayOffer[];
  config: TenantConfig;
}

export function StayCards({ stays, config }: StayCardsProps) {
  const isDark = config.uxHints.theme === 'dark';
  const isPriceHigh = config.uxHints.priceEmphasis === 'high';
  const isPriceLow = config.uxHints.priceEmphasis === 'low';

  if (stays.length === 0) {
    return <p style={{
      ...styles.empty,
      color: isDark ? '#888' : '#999',
    }}>No hotels found</p>;
  }

  return (
    <div style={{
      ...styles.grid,
      gridTemplateColumns: isPriceLow ? 'repeat(auto-fill, minmax(420px, 1fr))' : 
                          'repeat(auto-fill, minmax(300px, 1fr))',
      gap: isPriceLow ? '32px' : '20px',
    }}>
      {stays.map((stay) => {
        const rate = stay.rates[0];
        const hasWarnings = (stay.policy?.violations.length || 0) > 0;

        return (
          <div key={stay.id} style={{
            ...styles.card,
            background: isDark ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' : 'white',
            border: isDark ? '1px solid #3a3a3a' : 'none',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {/* Photo */}
            {stay.accommodation.photos && stay.accommodation.photos[0] && (
              <img
                src={stay.accommodation.photos[0]}
                alt={stay.accommodation.name}
                style={styles.image}
              />
            )}

            {/* Name */}
            <div style={{
              ...styles.name,
              color: isDark ? '#e5e5e5' : '#333',
              fontSize: isPriceLow ? '22px' : '18px',
              fontWeight: isPriceLow ? 300 : 600,
            }}>{stay.accommodation.name}</div>

            {/* Rating */}
            {stay.accommodation.rating && (
              <div style={{
                ...styles.rating,
                color: isDark ? '#d4af37' : '#666',
                fontSize: isPriceLow ? '16px' : '14px',
              }}>
                {'⭐'.repeat(Math.floor(stay.accommodation.rating))} {stay.accommodation.rating.toFixed(1)}
              </div>
            )}

            {/* Location */}
            {stay.accommodation.location?.city && (
              <div style={{
                ...styles.location,
                color: isDark ? '#888' : '#999',
              }}>{stay.accommodation.location.city}</div>
            )}

            {/* Price */}
            {rate && (
              <div style={{
                ...styles.price,
                fontSize: isPriceHigh ? '36px' : isPriceLow ? '32px' : '20px',
                fontWeight: isPriceHigh ? 800 : isPriceLow ? 300 : 700,
                color: isPriceHigh ? config.uxHints.primaryColor : isDark ? '#ffffff' : '#333',
                textAlign: isPriceHigh ? 'center' : 'left',
              }}>
                ${parseFloat(rate.price.amount).toFixed(0)}
                <span style={{
                  ...styles.perNight,
                  color: isDark ? '#999' : '#666',
                  fontSize: isPriceHigh ? '16px' : '14px',
                  display: isPriceHigh ? 'block' : 'inline',
                  marginTop: isPriceHigh ? '4px' : '0',
                  marginLeft: isPriceHigh ? '0' : '4px',
                }}>/night</span>
              </div>
            )}

            {/* Room type */}
            {rate?.roomName && (
              <div style={styles.roomType}>{rate.roomName}</div>
            )}

            {/* Policy warnings */}
            {config.uxHints.showPolicyCompliance &&
              stay.policy?.violations.map((v, idx) => (
                <div key={idx} style={styles.violation}>
                  ⚠️ {v.message}
                </div>
              ))}

            <button
              style={{ ...styles.button, background: config.uxHints.primaryColor }}
            >
              View Details
            </button>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as const,
  },
  name: {
    fontSize: '18px',
    fontWeight: 600,
    padding: '16px 16px 8px',
  },
  rating: {
    fontSize: '14px',
    padding: '0 16px 8px',
    color: '#666',
  },
  location: {
    fontSize: '14px',
    padding: '0 16px 8px',
    color: '#999',
  },
  price: {
    padding: '8px 16px',
    fontWeight: 700,
    color: '#333',
  },
  perNight: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#666',
  },
  roomType: {
    fontSize: '13px',
    padding: '0 16px 12px',
    color: '#666',
  },
  violation: {
    margin: '0 16px 12px',
    padding: '8px',
    background: '#fff3cd',
    color: '#856404',
    borderRadius: '6px',
    fontSize: '12px',
  },
  button: {
    width: 'calc(100% - 32px)',
    margin: '0 16px 16px',
    color: 'white',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#999',
  },
};

