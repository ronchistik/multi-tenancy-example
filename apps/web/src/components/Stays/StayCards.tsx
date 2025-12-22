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
  if (stays.length === 0) {
    return <p style={styles.empty}>No hotels found</p>;
  }

  return (
    <div style={styles.grid}>
      {stays.map((stay) => {
        const rate = stay.rates[0];
        const hasWarnings = (stay.policy?.violations.length || 0) > 0;

        return (
          <div key={stay.id} style={styles.card}>
            {/* Photo */}
            {stay.accommodation.photos && stay.accommodation.photos[0] && (
              <img
                src={stay.accommodation.photos[0]}
                alt={stay.accommodation.name}
                style={styles.image}
              />
            )}

            {/* Name */}
            <div style={styles.name}>{stay.accommodation.name}</div>

            {/* Rating */}
            {stay.accommodation.rating && (
              <div style={styles.rating}>
                {'⭐'.repeat(Math.floor(stay.accommodation.rating))} {stay.accommodation.rating.toFixed(1)}
              </div>
            )}

            {/* Location */}
            {stay.accommodation.location?.city && (
              <div style={styles.location}>{stay.accommodation.location.city}</div>
            )}

            {/* Price */}
            {rate && (
              <div style={{
                ...styles.price,
                fontSize: config.uxHints.priceEmphasis === 'high' ? '28px' : '20px',
              }}>
                {parseFloat(rate.price.amount).toFixed(0)} {rate.price.currency}
                <span style={styles.perNight}>/night</span>
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

