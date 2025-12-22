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
  const tokens = config.uxHints.designTokens;

  if (stays.length === 0) {
    return <p style={{
      textAlign: 'center',
      padding: '40px',
      color: tokens.colors.textSecondary,
    }}>No hotels found</p>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: tokens.spacing.cardGap,
    }}>
      {stays.map((stay) => {
        const rate = stay.rates[0];
        const hasWarnings = (stay.policy?.violations.length || 0) > 0;

        return (
          <div key={stay.id} style={{
            background: tokens.colors.cardBackground,
            borderRadius: tokens.borders.cardRadius,
            overflow: 'hidden',
            boxShadow: tokens.shadows.card,
            border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
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
              fontSize: '18px',
              fontWeight: 600,
              padding: '16px 16px 8px',
              color: tokens.colors.textPrimary,
            }}>{stay.accommodation.name}</div>

            {/* Rating */}
            {stay.accommodation.rating && (
              <div style={{
                fontSize: '14px',
                padding: '0 16px 8px',
                color: tokens.colors.textSecondary,
              }}>
                {'⭐'.repeat(Math.floor(stay.accommodation.rating))} {stay.accommodation.rating.toFixed(1)}
              </div>
            )}

            {/* Location */}
            {stay.accommodation.location?.city && (
              <div style={{
                fontSize: '14px',
                padding: '0 16px 8px',
                color: tokens.colors.textSecondary,
              }}>{stay.accommodation.location.city}</div>
            )}

            {/* Price */}
            {rate && (
              <div style={{
                padding: '8px 16px',
                fontSize: tokens.typography.priceSize,
                fontWeight: tokens.typography.priceWeight,
                color: config.uxHints.priceEmphasis === 'high' ? config.uxHints.primaryColor : tokens.colors.textPrimary,
              }}>
                ${parseFloat(rate.price.amount).toFixed(0)}
                <span style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: tokens.colors.textSecondary,
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
              style={{ 
                width: 'calc(100% - 32px)',
                margin: '0 16px 16px',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                background: config.uxHints.primaryColor,
                color: 'white',
                fontSize: tokens.typography.buttonSize,
                fontWeight: tokens.typography.buttonWeight,
                padding: tokens.spacing.buttonPadding,
                borderRadius: tokens.borders.buttonRadius,
                textTransform: config.uxHints.priceEmphasis === 'low' ? 'uppercase' : 'none',
                letterSpacing: config.uxHints.priceEmphasis === 'low' ? '1px' : 'normal',
              }}
            >
              {config.uxHints.buttonLabels?.selectStay || 'View Details'}
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

