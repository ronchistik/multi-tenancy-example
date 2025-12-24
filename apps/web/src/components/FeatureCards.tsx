/**
 * FeatureCards Component
 * Displays Trivago-style feature cards from tenant config
 */

import React, { useState, useEffect } from 'react';
import type { TenantConfig } from '../api';

interface FeatureCardsProps {
  config: TenantConfig;
}

export function FeatureCards({ config }: FeatureCardsProps) {
  const cards = config.uxHints.featureCards;
  const tokens = config.uxHints.designTokens;
  
  // Responsive sizing for smaller screens
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1200);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!cards || cards.length === 0) return null;
  
  const imageSize = isSmallScreen ? { width: '100px', height: '75px' } : { width: '160px', height: '120px' };
  const containerPadding = isSmallScreen ? '24px 16px' : '48px 20px';
  const gap = isSmallScreen ? '16px' : '32px';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(cards.length, 3)}, 1fr)`,
      gap,
      padding: containerPadding,
      maxWidth: '1000px',
      margin: '0 auto',
      background: tokens?.colors?.background || '#f8f9fa',
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            textAlign: 'center',
            padding: isSmallScreen ? '12px' : '20px',
          }}
        >
          {/* Cartoon illustration */}
          <div style={{
            width: imageSize.width,
            height: imageSize.height,
            margin: '0 auto 12px',
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

