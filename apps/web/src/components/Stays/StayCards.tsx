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
    return (
      <p className="text-center py-10" style={{ color: tokens.colors.textSecondary }}>
        No hotels found
      </p>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      style={{ gap: tokens.spacing.cardGap }}
    >
      {stays.map((stay) => {
        const rate = stay.rates[0];
        const hasWarnings = (stay.policy?.violations.length || 0) > 0;

        return (
          <div 
            key={stay.id} 
            className="overflow-hidden"
            style={{
              background: tokens.colors.cardBackground,
              borderRadius: tokens.borders.cardRadius,
              boxShadow: tokens.shadows.card,
              border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
            }}
          >
            {/* Photo */}
            {stay.accommodation.photos && stay.accommodation.photos[0] && (
              <img
                src={stay.accommodation.photos[0]}
                alt={stay.accommodation.name}
                className="w-full h-48 object-cover"
              />
            )}

            {/* Name */}
            <div 
              className="text-lg font-semibold px-4 pt-4 pb-2"
              style={{ color: tokens.colors.textPrimary }}
            >
              {stay.accommodation.name}
            </div>

            {/* Rating */}
            {stay.accommodation.rating && (
              <div 
                className="text-sm px-4 pb-2"
                style={{ color: tokens.colors.textSecondary }}
              >
                {'⭐'.repeat(Math.floor(stay.accommodation.rating))} {stay.accommodation.rating.toFixed(1)}
              </div>
            )}

            {/* Location */}
            {stay.accommodation.location?.city && (
              <div 
                className="text-sm px-4 pb-2"
                style={{ color: tokens.colors.textSecondary }}
              >
                {stay.accommodation.location.city}
              </div>
            )}

            {/* Price */}
            {rate && (
              <div 
                className="px-4 py-2"
                style={{
                  fontSize: tokens.typography.priceSize,
                  fontWeight: tokens.typography.priceWeight,
                  color: config.uxHints.priceEmphasis === 'high' ? config.uxHints.primaryColor : tokens.colors.textPrimary,
                }}
              >
                ${parseFloat(rate.price.amount).toFixed(0)}
                <span 
                  className="text-sm font-normal"
                  style={{ color: tokens.colors.textSecondary }}
                >
                  /night
                </span>
              </div>
            )}

            {/* Room type */}
            {rate?.roomName && (
              <div className="text-xs px-4 pb-3" style={{ color: tokens.colors.textSecondary }}>
                {rate.roomName}
              </div>
            )}

            {/* Policy warnings */}
            {config.uxHints.showPolicyCompliance &&
              stay.policy?.violations.map((v, idx) => (
                <div 
                  key={idx} 
                  className="mx-4 mb-3 p-2 bg-amber-50 text-amber-800 rounded text-xs"
                >
                  ⚠️ {v.message}
                </div>
              ))}

            <button
              className={`
                w-full mx-4 mb-4 cursor-pointer border-none transition-all
                ${config.uxHints.priceEmphasis === 'low' ? 'uppercase tracking-wide' : ''}
              `}
              style={{ 
                width: 'calc(100% - 32px)',
                background: config.uxHints.primaryColor,
                color: 'white',
                fontSize: tokens.typography.buttonSize,
                fontWeight: tokens.typography.buttonWeight,
                padding: tokens.spacing.buttonPadding,
                borderRadius: tokens.borders.buttonRadius,
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
