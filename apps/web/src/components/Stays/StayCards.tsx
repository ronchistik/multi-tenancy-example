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
  const isLuxury = config.id === 'apex-reserve';
  const isBudget = config.id === 'saver-trips';

  if (stays.length === 0) {
    return <p style={{
      ...styles.empty,
      color: isLuxury ? '#888' : '#999',
    }}>No hotels found</p>;
  }

  return (
    <div style={{
      ...styles.grid,
      gridTemplateColumns: isLuxury ? 'repeat(auto-fill, minmax(420px, 1fr))' : 
                          'repeat(auto-fill, minmax(300px, 1fr))',
      gap: isLuxury ? '32px' : '20px',
    }}>
      {stays.map((stay) => {
        const rate = stay.rates[0];
        const hasWarnings = (stay.policy?.violations.length || 0) > 0;

        return (
          <div key={stay.id} style={{
            ...styles.card,
            background: isLuxury ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' : 'white',
            border: isLuxury ? '1px solid #3a3a3a' : 'none',
            boxShadow: isLuxury ? '0 8px 32px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.1)',
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
              color: isLuxury ? '#e5e5e5' : '#333',
              fontSize: isLuxury ? '22px' : '18px',
              fontWeight: isLuxury ? 300 : 600,
            }}>{stay.accommodation.name}</div>

            {/* Rating */}
            {stay.accommodation.rating && (
              <div style={{
                ...styles.rating,
                color: isLuxury ? '#d4af37' : '#666',
                fontSize: isLuxury ? '16px' : '14px',
              }}>
                {'⭐'.repeat(Math.floor(stay.accommodation.rating))} {stay.accommodation.rating.toFixed(1)}
              </div>
            )}

            {/* Location */}
            {stay.accommodation.location?.city && (
              <div style={{
                ...styles.location,
                color: isLuxury ? '#888' : '#999',
              }}>{stay.accommodation.location.city}</div>
            )}

            {/* Price */}
            {rate && (
              <div style={{
                ...styles.price,
                fontSize: isBudget ? '36px' : isLuxury ? '32px' : '20px',
                fontWeight: isBudget ? 800 : isLuxury ? 300 : 700,
                color: isBudget ? config.uxHints.primaryColor : isLuxury ? '#ffffff' : '#333',
                textAlign: isBudget ? 'center' : 'left',
              }}>
                ${parseFloat(rate.price.amount).toFixed(0)}
                <span style={{
                  ...styles.perNight,
                  color: isLuxury ? '#999' : '#666',
                  fontSize: isBudget ? '16px' : '14px',
                  display: 'block',
                  marginTop: isBudget ? '4px' : '0',
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

