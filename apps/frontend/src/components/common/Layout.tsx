/**
 * Layout component
 */

import React from 'react';
import type { TenantConfig } from '../../api';
import { FeatureCards } from '../features/FeatureCards';

interface LayoutProps {
  config: TenantConfig;
  children: React.ReactNode;
  hideFeatureCards?: boolean; // Hide when PageRenderer handles them
}

export function Layout({ config, children, hideFeatureCards = false }: LayoutProps) {
  const tokens = config.uxHints.designTokens;
  const isDense = config.uxHints.layout === 'table';
  const hasHeroImage = !!config.uxHints.backgroundImage;
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: tokens.colors.background,
        fontFamily: tokens.typography.fontFamily,
        color: tokens.colors.textPrimary,
      }}
    >
      {/* Hero header with optional background image */}
      <header 
        className={`
          text-white text-center relative overflow-hidden
          ${hasHeroImage ? 'min-h-[180px] md:min-h-[280px] flex flex-col justify-center items-center' : ''}
          ${!hasHeroImage && isDense ? 'py-3 px-5 shadow-sm' : ''}
          ${!hasHeroImage && !isDense ? 'py-6 px-5' : ''}
        `}
        style={{
          background: !hasHeroImage ? config.uxHints.primaryColor : undefined,
        }}
      >
        {/* Background image */}
        {hasHeroImage && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center brightness-[0.6]"
              style={{
                backgroundImage: `url(${config.uxHints.backgroundImage})`,
              }}
            />
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, 
                  rgba(0,0,0,0.3) 0%, 
                  rgba(0,0,0,0.5) 50%, 
                  ${config.uxHints.primaryColor}90 100%)`,
              }}
            />
          </>
        )}
        
        {/* Header content */}
        <div className={`relative z-10 ${hasHeroImage ? 'py-6 px-4 md:py-10 md:px-5' : ''}`}>
          <h1 
            className={`
              ${hasHeroImage ? 'mb-2 md:mb-3' : 'mb-1'}
              ${config.uxHints.priceEmphasis === 'low' ? 'uppercase tracking-widest' : 'tracking-wide'}
            `}
            style={{
              fontSize: hasHeroImage ? 'clamp(28px, 5vw, 42px)' : tokens.typography.headingSize,
              fontWeight: tokens.typography.headingWeight,
              textShadow: hasHeroImage ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {config.uxHints.brandName}
          </h1>
          <p 
            className={`
              opacity-90 max-w-2xl mx-auto font-light text-center
              ${isDense && !hasHeroImage ? 'hidden' : 'block'}
            `}
            style={{
              fontSize: hasHeroImage ? 'clamp(14px, 2.5vw, 18px)' : tokens.typography.bodySize,
              textShadow: hasHeroImage ? '0 1px 10px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {config.uxHints.tagline || 'Multi-Tenant Travel Platform Demo'}
          </p>
        </div>
      </header>

      {/* Trivago-style feature cards (hidden when PageRenderer handles them) */}
      {!hideFeatureCards && config.uxHints.featureCards && config.uxHints.featureCards.length > 0 && (
        <FeatureCards config={config} />
      )}
      
      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 w-full">
        <div style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
}


