/**
 * FeatureCards Component
 * Displays Trivago-style feature cards from tenant config
 */

import React from 'react';
import type { TenantConfig } from '../api';

interface FeatureCardsProps {
  config: TenantConfig;
}

export function FeatureCards({ config }: FeatureCardsProps) {
  const cards = config.uxHints.featureCards;
  const tokens = config.uxHints.designTokens;

  if (!cards || cards.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(cards.length, 3)}, 1fr)`,
      gap: '32px',
      padding: '48px 20px',
      maxWidth: '1000px',
      margin: '0 auto',
      background: tokens?.colors?.background || '#f8f9fa',
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            textAlign: 'center',
            padding: '20px',
          }}
        >
          {/* Cartoon illustration */}
          <div style={{
            width: '160px',
            height: '120px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={card.imageUrl}
              alt={card.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          
          {/* Title */}
          <h3 style={{
            fontSize: tokens?.typography?.subheadingSize || '20px',
            fontWeight: tokens?.typography?.subheadingWeight || 600,
            fontFamily: tokens?.typography?.fontFamily || 'inherit',
            color: tokens?.colors?.textPrimary || '#1a1a1a',
            marginBottom: '8px',
          }}>
            {card.title}
          </h3>
          
          {/* Description */}
          <p style={{
            fontSize: tokens?.typography?.bodySize || '15px',
            fontWeight: tokens?.typography?.bodyWeight || 400,
            fontFamily: tokens?.typography?.fontFamily || 'inherit',
            color: tokens?.colors?.textSecondary || '#6b7280',
            lineHeight: 1.5,
            margin: 0,
          }}>
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}

