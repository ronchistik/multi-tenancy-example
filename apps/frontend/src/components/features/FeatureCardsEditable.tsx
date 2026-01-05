/**
 * FeatureCards Component (Craft.js Editable)
 * Trivago-style feature cards with cartoon illustrations
 */

import React from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig } from '../../api';

interface FeatureCard {
  title: string;
  description: string;
  imageUrl: string;
}

interface FeatureCardsEditableProps {
  cards?: FeatureCard[];
  config?: TenantConfig;
}

const defaultCards: FeatureCard[] = [
  {
    title: 'Search simply',
    description: 'Easily search through hundreds of flights in seconds.',
    imageUrl: 'https://imgcy.trivago.com/hardcodedimages/homepage-landing/usp/SearchDesktop.svg',
  },
  {
    title: 'Compare confidently',
    description: 'Compare flight prices from 100s of sites at once.',
    imageUrl: 'https://imgcy.trivago.com/hardcodedimages/homepage-landing/usp/CompareDesktop.svg',
  },
  {
    title: 'Save big',
    description: 'Discover great deals to book on our partner sites.',
    imageUrl: 'https://imgcy.trivago.com/hardcodedimages/homepage-landing/usp/SaveDesktop.svg',
  },
];

export function FeatureCardsEditable({ 
  cards = defaultCards,
  config,
}: FeatureCardsEditableProps) {
  const { connectors: { connect, drag } } = useNode();
  const tokens = config?.uxHints?.designTokens;
  
  // Dynamic grid based on card count
  // const _gridCols = Math.min(cards.length, 3);

  return (
    <div 
      ref={(ref) => ref && connect(drag(ref))}
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

// Settings panel
function FeatureCardsSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const cards: FeatureCard[] = props.cards || defaultCards;

  const updateCard = (index: number, field: keyof FeatureCard, value: string) => {
    setProp((props: FeatureCardsEditableProps) => {
      const newCards = [...(props.cards || defaultCards)];
      newCards[index] = { ...newCards[index]!, [field]: value } as FeatureCard;
      props.cards = newCards;
    });
  };

  const addCard = () => {
    setProp((props: FeatureCardsEditableProps) => {
      const newCards = [...(props.cards || defaultCards)];
      newCards.push({
        title: 'New Feature',
        description: 'Description here',
        imageUrl: 'https://imgcy.trivago.com/hardcodedimages/homepage-landing/usp/SearchDesktop.svg',
      });
      props.cards = newCards;
    });
  };

  const removeCard = (index: number) => {
    setProp((props: FeatureCardsEditableProps) => {
      const newCards = [...(props.cards || defaultCards)];
      newCards.splice(index, 1);
      props.cards = newCards;
    });
  };

  return (
    <div style={{ padding: '10px', maxHeight: '500px', overflow: 'auto' }}>
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '12px',
        fontSize: '11px',
        color: '#0c4a6e',
      }}>
        💡 Edit the feature cards shown below the header. Each card has a title, description, and image.
      </div>

      {cards.map((card, index) => (
        <div 
          key={index}
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
              Card {index + 1}
            </span>
            {cards.length > 1 && (
              <button
                onClick={() => removeCard(index)}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            )}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
              Title
            </label>
            <input
              type="text"
              value={card.title}
              onChange={(e) => updateCard(index, 'title', e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
              Description
            </label>
            <textarea
              value={card.description}
              onChange={(e) => updateCard(index, 'description', e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
              Image URL
            </label>
            <input
              type="text"
              value={card.imageUrl}
              onChange={(e) => updateCard(index, 'imageUrl', e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            />
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#6b7280' }}>
              Trivago assets:<br/>
              • SearchDesktop.svg<br/>
              • CompareDesktop.svg<br/>
              • SaveDesktop.svg
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addCard}
        style={{
          width: '100%',
          padding: '10px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        + Add Card
      </button>
    </div>
  );
}

FeatureCardsEditable.craft = {
  displayName: 'Feature Cards',
  props: {
    cards: defaultCards,
  },
  related: {
    settings: FeatureCardsSettings,
  },
  custom: {
    displayName: 'Feature Cards',
  },
  rules: {
    canDrag: () => true,
    canDelete: () => true,
    canMoveIn: () => false,
    canMoveOut: () => false,
  },
};

