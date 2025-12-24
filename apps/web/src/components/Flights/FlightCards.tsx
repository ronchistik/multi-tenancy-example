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
    return (
      <p className="text-center py-10" style={{ color: tokens.colors.textSecondary }}>
        No flights found
      </p>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      style={{ gap: tokens.spacing.cardGap }}
    >
      {offers.map((offer) => (
        <div 
          key={offer.id} 
          className="relative"
          style={{
            background: tokens.colors.cardBackground,
            padding: tokens.spacing.cardPadding,
            borderRadius: tokens.borders.cardRadius,
            boxShadow: tokens.shadows.card,
            border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
          }}
        >
          {/* Policy badges */}
          {offer.policy?.preferred && config.uxHints.highlightPreferred && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-xl text-xs font-semibold">
              ✓ Preferred
            </div>
          )}
          
          {/* Promotional badges - shown above content */}
          {config.uxHints.showPromotions && offer.policy?.promotions && offer.policy.promotions.map((promo, idx) => (
            <div 
              key={idx} 
              className="text-white px-4 py-2 rounded-lg mb-4 text-center font-semibold shadow-md"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: tokens.typography.bodySize,
                fontFamily: tokens.typography.fontFamily,
              }}
            >
              ✨ {promo.message}
            </div>
          ))}
          
          {/* Price */}
          <div 
            className={`mb-2 ${config.uxHints.priceEmphasis === 'high' ? 'text-center' : 'text-left'}`}
            style={{
              fontSize: tokens.typography.priceSize,
              fontWeight: tokens.typography.priceWeight,
              color: config.uxHints.priceEmphasis === 'high' ? config.uxHints.primaryColor : tokens.colors.textPrimary,
            }}
          >
            ${parseFloat(offer.price.amount).toFixed(0)}
            <span 
              className={config.uxHints.priceEmphasis === 'high' ? 'block mt-1' : 'inline ml-1'}
              style={{
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                color: tokens.colors.textSecondary,
              }}
            >
              {offer.price.currency}
            </span>
          </div>

          {/* Airline */}
          <div 
            className={`mb-3 ${config.uxHints.priceEmphasis === 'high' ? 'text-center' : 'text-left'}`}
            style={{
              fontSize: tokens.typography.bodySize,
              fontWeight: tokens.typography.bodyWeight,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.colors.textSecondary,
            }}
          >
            {offer.owner.name}
          </div>

          {/* Route */}
          {offer.slices.map((slice, idx) => (
            <div 
              key={idx} 
              className="mb-3 pb-3"
              style={{ borderBottom: '1px solid ' + tokens.colors.border }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-lg font-semibold"
                  style={{ color: tokens.colors.textPrimary }}
                >
                  {slice.origin.code}
                </span>
                <span className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                  →
                </span>
                <span 
                  className="text-lg font-semibold"
                  style={{ color: tokens.colors.textPrimary }}
                >
                  {slice.destination.code}
                </span>
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
                className="p-2 rounded text-xs mt-2"
                style={{
                  background: v.severity === 'error' ? '#fee' : v.severity === 'info' ? '#e0f2fe' : '#fff3cd',
                  color: v.severity === 'error' ? '#c00' : v.severity === 'info' ? '#0369a1' : '#856404',
                }}
              >
                {v.severity === 'error' ? '🚫' : v.severity === 'info' ? 'ℹ️' : '⚠️'} {v.message}
              </div>
            ))}

          <button
            className={`
              w-full cursor-pointer border-none transition-all mt-3
              ${config.uxHints.priceEmphasis === 'low' ? 'uppercase tracking-wide' : ''}
            `}
            style={{ 
              background: config.uxHints.primaryColor,
              color: 'white',
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.buttonSize,
              fontWeight: tokens.typography.buttonWeight,
              padding: tokens.spacing.buttonPadding,
              borderRadius: tokens.borders.buttonRadius,
            }}
          >
            {config.uxHints.buttonLabels?.selectFlight || 'Select'}
          </button>
        </div>
      ))}
    </div>
  );
}

