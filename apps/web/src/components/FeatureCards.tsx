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

  const gridCols = Math.min(cards.length, 3);

  return (
    <div 
      className="w-full py-4 md:py-8"
      style={{ background: tokens?.colors?.background || '#f8f9fa' }}
    >
      <div 
        className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 px-2 sm:px-4 md:px-5"
        style={{ 
          maxWidth: '1024px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
      {cards.map((card, index) => (
        <div
          key={index}
          className="text-center p-2 sm:p-3 md:p-4"
          style={{ 
            flex: cards.length >= 3 ? '1 1 30%' : cards.length === 2 ? '1 1 40%' : '1 1 60%',
            maxWidth: cards.length >= 3 ? '33%' : cards.length === 2 ? '50%' : '100%',
            minWidth: '120px',
          }}
        >
          {/* Cartoon illustration */}
          <div className="w-16 h-12 sm:w-24 sm:h-18 md:w-32 md:h-24 mx-auto mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
            <img
              src={card.imageUrl}
              alt={card.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Title */}
          <h3 
            className="mb-2"
            style={{
              fontSize: tokens?.typography?.subheadingSize || '20px',
              fontWeight: tokens?.typography?.subheadingWeight || 600,
              fontFamily: tokens?.typography?.fontFamily || 'inherit',
              color: tokens?.colors?.textPrimary || '#1a1a1a',
            }}
          >
            {card.title}
          </h3>
          
          {/* Description */}
          <p 
            className="leading-relaxed m-0"
            style={{
              fontSize: tokens?.typography?.bodySize || '15px',
              fontWeight: tokens?.typography?.bodyWeight || 400,
              fontFamily: tokens?.typography?.fontFamily || 'inherit',
              color: tokens?.colors?.textSecondary || '#6b7280',
            }}
          >
            {card.description}
          </p>
        </div>
      ))}
      </div>
    </div>
  );
}

