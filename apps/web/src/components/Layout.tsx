/**
 * Layout component
 */

import React, { useState, useEffect } from 'react';
import type { TenantConfig } from '../api';
import { FeatureCards } from './FeatureCards';

interface LayoutProps {
  config: TenantConfig;
  children: React.ReactNode;
  hideFeatureCards?: boolean; // Hide when PageRenderer handles them
}

export function Layout({ config, children, hideFeatureCards = false }: LayoutProps) {
  const tokens = config.uxHints.designTokens;
  const isDense = config.uxHints.layout === 'table';
  const hasHeroImage = !!config.uxHints.backgroundImage;
  
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
  
  // Responsive hero sizes
  const heroHeight = isSmallScreen ? '180px' : '280px';
  const heroTitleSize = isSmallScreen ? '28px' : '42px';
  const heroSubtitleSize = isSmallScreen ? '14px' : '18px';
  const heroPadding = isSmallScreen ? '24px 16px' : '40px 20px';
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: tokens.colors.background,
      fontFamily: tokens.typography.fontFamily,
      color: tokens.colors.textPrimary,
    }}>
      {/* Hero header with optional background image */}
      <header style={{ 
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...(hasHeroImage ? {
          minHeight: heroHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        } : {
          padding: isDense ? '12px 20px' : (isSmallScreen ? '20px 16px' : '28px 20px'),
        background: config.uxHints.primaryColor,
        boxShadow: isDense ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        }),
      }}>
        {/* Background image */}
        {hasHeroImage && (
          <>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${config.uxHints.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.6)',
            }} />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(180deg, 
                rgba(0,0,0,0.3) 0%, 
                rgba(0,0,0,0.5) 50%, 
                ${config.uxHints.primaryColor}90 100%)`,
            }} />
          </>
        )}
        
        {/* Header content */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          padding: hasHeroImage ? heroPadding : '0',
      }}>
        <h1 style={{
            fontSize: hasHeroImage ? heroTitleSize : tokens.typography.headingSize,
          fontWeight: tokens.typography.headingWeight,
            marginBottom: hasHeroImage ? (isSmallScreen ? '8px' : '12px') : '4px',
            letterSpacing: config.uxHints.priceEmphasis === 'low' ? '4px' : '1px',
          textTransform: config.uxHints.priceEmphasis === 'low' ? 'uppercase' : 'none',
            textShadow: hasHeroImage ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
        }}>
          {config.uxHints.brandName}
        </h1>
        <p style={{
            fontSize: hasHeroImage ? heroSubtitleSize : tokens.typography.bodySize,
          opacity: 0.9,
            display: isDense && !hasHeroImage ? 'none' : 'block',
            textShadow: hasHeroImage ? '0 1px 10px rgba(0,0,0,0.5)' : 'none',
            maxWidth: '600px',
            margin: '0 auto',
            fontWeight: 300,
        }}>
          {config.uxHints.tagline || 'Multi-Tenant Travel Platform Demo'}
        </p>
        </div>
      </header>

      {/* Trivago-style feature cards (hidden when PageRenderer handles them) */}
      {!hideFeatureCards && config.uxHints.featureCards && config.uxHints.featureCards.length > 0 && (
        <FeatureCards config={config} />
      )}
      
      <main style={{
        flex: 1,
        padding: '20px',
        maxWidth: isDense ? '1600px' : '1200px',
        margin: '0 auto',
        width: '100%',
      }}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    color: 'white',
    padding: '20px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.9,
  },
  main: {
    flex: 1,
    padding: '20px',
  },
};

