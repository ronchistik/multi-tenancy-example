/**
 * Page Builder - Visual page editor using design tokens
 */

import React, { useState } from 'react';
import type { TenantConfig, FlightOffer, StayOffer, Location } from '../api';
import { FlightCards } from '../components/Flights/FlightCards';
import { FlightTable } from '../components/Flights/FlightTable';
import { StayCards } from '../components/Stays/StayCards';
import { StayTable } from '../components/Stays/StayTable';

interface PageBuilderProps {
  config: TenantConfig;
  locations?: Location[];
  onFlightSearch?: (request: any) => Promise<{ offers: FlightOffer[] }>;
  onStaySearch?: (request: any) => Promise<{ stays: StayOffer[] }>;
}

type ComponentType = 'hero' | 'flightSearch' | 'hotelSearch' | 'flightResults' | 'hotelResults' | 'text' | 'spacer' | 'twoColumn';

interface PageComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
}

export function PageBuilder({ config, locations = [], onFlightSearch, onStaySearch }: PageBuilderProps) {
  const tokens = config.uxHints.designTokens;
  const [components, setComponents] = useState<PageComponent[]>([
    {
      id: '1',
      type: 'hero',
      props: {
        title: 'Welcome to ' + config.uxHints.brandName,
        subtitle: config.uxHints.tagline || 'Discover amazing travel deals',
      },
    },
  ]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const addComponent = (type: ComponentType) => {
    const newComponent: PageComponent = {
      id: Date.now().toString(),
      type,
      props: getDefaultProps(type),
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
  };

  const moveUp = (id: string) => {
    const index = components.findIndex((c) => c.id === id);
    if (index > 0) {
      const newComponents = [...components];
      [newComponents[index - 1], newComponents[index]] = [newComponents[index]!, newComponents[index - 1]!];
      setComponents(newComponents);
    }
  };

  const moveDown = (id: string) => {
    const index = components.findIndex((c) => c.id === id);
    if (index < components.length - 1) {
      const newComponents = [...components];
      [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1]!, newComponents[index]!];
      setComponents(newComponents);
    }
  };

  const updateProp = (id: string, key: string, value: any) => {
    setComponents(
      components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c
      )
    );
  };

  const exportConfig = () => {
    const config = JSON.stringify(components, null, 2);
    console.log('Page Configuration:', config);
    alert('Page configuration logged to console!');
  };

  // Preview Mode - Full screen
  if (previewMode) {
    return (
      <div style={{
        minHeight: '100vh',
        background: tokens.colors.background,
        fontFamily: tokens.typography.fontFamily,
      }}>
        {/* Preview Header */}
        <div style={{
          padding: '16px 20px',
          background: config.uxHints.primaryColor,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{
            fontSize: tokens.typography.headingSize,
            fontWeight: tokens.typography.headingWeight,
            margin: 0,
          }}>
            Preview Mode
          </h2>
          <button
            onClick={() => setPreviewMode(false)}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: tokens.borders.buttonRadius,
              cursor: 'pointer',
              fontSize: tokens.typography.bodySize,
              fontFamily: tokens.typography.fontFamily,
              fontWeight: 600,
            }}
          >
            ← Back to Editor
          </button>
        </div>

        {/* Preview Content */}
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          {components.map((component) => (
            <div key={component.id} style={{ marginBottom: '20px' }}>
              {renderComponent(component, tokens, config)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Builder Mode
  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '80vh' }}>
      {/* Left Panel - Component Library */}
      <div style={{
        width: '250px',
        background: tokens.colors.cardBackground,
        padding: '20px',
        borderRadius: tokens.borders.cardRadius,
        boxShadow: tokens.shadows.card,
      }}>
        <h3 style={{
          fontSize: tokens.typography.subheadingSize,
          fontWeight: tokens.typography.subheadingWeight,
          color: tokens.colors.textPrimary,
          marginBottom: '16px',
        }}>
          Add Components
        </h3>
        
        {(['hero', 'flightSearch', 'hotelSearch', 'flightResults', 'hotelResults', 'text', 'twoColumn', 'spacer'] as ComponentType[]).map((type) => (
          <button
            key={type}
            onClick={() => addComponent(type)}
            style={{
              width: '100%',
              marginBottom: '8px',
              padding: '10px',
              background: config.uxHints.primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: tokens.borders.buttonRadius,
              cursor: 'pointer',
              fontSize: tokens.typography.bodySize,
              fontFamily: tokens.typography.fontFamily,
            }}
          >
            + {formatComponentName(type)}
          </button>
        ))}

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid ' + tokens.colors.border }} />

        <button
          onClick={() => setPreviewMode(true)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '8px',
            background: config.uxHints.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: tokens.borders.buttonRadius,
            cursor: 'pointer',
            fontSize: tokens.typography.bodySize,
            fontFamily: tokens.typography.fontFamily,
            fontWeight: 600,
          }}
        >
          👁️ Preview Page
        </button>

        <button
          onClick={exportConfig}
          style={{
            width: '100%',
            padding: '12px',
            background: tokens.colors.success,
            color: 'white',
            border: 'none',
            borderRadius: tokens.borders.buttonRadius,
            cursor: 'pointer',
            fontSize: tokens.typography.bodySize,
            fontFamily: tokens.typography.fontFamily,
            fontWeight: 600,
          }}
        >
          💾 Export Config
        </button>
      </div>

      {/* Middle Panel - Preview */}
      <div style={{
        flex: 1,
        background: tokens.colors.background,
        borderRadius: tokens.borders.cardRadius,
        overflow: 'auto',
        border: '2px dashed ' + tokens.colors.border,
      }}>
        <div style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: tokens.typography.headingSize,
            color: tokens.colors.textPrimary,
            marginBottom: '20px',
          }}>
            Page Preview
          </h3>
          
          {components.map((component, index) => (
            <div
              key={component.id}
              style={{
                marginBottom: '16px',
                border: selectedComponent === component.id ? '2px solid ' + config.uxHints.primaryColor : '2px solid transparent',
                borderRadius: tokens.borders.cardRadius,
                padding: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedComponent(component.id)}
            >
              {renderComponent(component, tokens, config)}
              
              {/* Component controls */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                justifyContent: 'center',
              }}>
                <button onClick={() => moveUp(component.id)} style={controlButtonStyle(tokens)}>
                  ↑
                </button>
                <button onClick={() => moveDown(component.id)} style={controlButtonStyle(tokens)}>
                  ↓
                </button>
                <button onClick={() => removeComponent(component.id)} style={{
                  ...controlButtonStyle(tokens),
                  background: tokens.colors.error,
                }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Properties */}
      {selectedComponent && (
        <div style={{
          width: '300px',
          background: tokens.colors.cardBackground,
          padding: '20px',
          borderRadius: tokens.borders.cardRadius,
          boxShadow: tokens.shadows.card,
        }}>
          <h3 style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '16px',
          }}>
            Properties
          </h3>
          
          {(() => {
            const component = components.find((c) => c.id === selectedComponent);
            if (!component) return null;

            return (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.labelSize,
                    color: tokens.colors.textSecondary,
                    marginBottom: '4px',
                  }}>
                    Component Type
                  </label>
                  <div style={{
                    padding: '8px',
                    background: tokens.colors.inputBackground,
                    borderRadius: tokens.borders.inputRadius,
                    fontSize: tokens.typography.bodySize,
                    color: tokens.colors.textPrimary,
                  }}>
                    {component.type}
                  </div>
                </div>

                {Object.entries(component.props).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '12px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: tokens.typography.labelSize,
                      color: tokens.colors.textSecondary,
                      marginBottom: '4px',
                    }}>
                      {key}
                    </label>
                    {typeof value === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateProp(component.id, key, e.target.checked)}
                      />
                    ) : (
                      <input
                        type="text"
                        value={value as string}
                        onChange={(e) => updateProp(component.id, key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: tokens.spacing.inputPadding,
                          fontSize: tokens.typography.bodySize,
                          fontFamily: tokens.typography.fontFamily,
                          background: tokens.colors.inputBackground,
                          color: tokens.colors.textPrimary,
                          border: '1px solid ' + tokens.colors.inputBorder,
                          borderRadius: tokens.borders.inputRadius,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function formatComponentName(type: ComponentType): string {
  const names: Record<ComponentType, string> = {
    hero: 'Hero Banner',
    flightSearch: 'Flight Search',
    hotelSearch: 'Hotel Search',
    flightResults: 'Flight Results',
    hotelResults: 'Hotel Results',
    text: 'Text Block',
    twoColumn: 'Two Columns',
    spacer: 'Spacer',
  };
  return names[type];
}

function getDefaultProps(type: ComponentType): Record<string, any> {
  switch (type) {
    case 'hero':
      return { title: 'Hero Title', subtitle: 'Hero subtitle text' };
    case 'text':
      return { content: 'Your text here', alignment: 'left', fontSize: '16px' };
    case 'flightSearch':
      return { title: 'Search Flights' };
    case 'hotelSearch':
      return { title: 'Search Hotels' };
    case 'flightResults':
      return { title: 'Available Flights', layout: 'cards' };
    case 'hotelResults':
      return { title: 'Available Hotels', layout: 'cards' };
    case 'twoColumn':
      return { leftContent: 'Left column text', rightContent: 'Right column text' };
    case 'spacer':
      return { height: '40px' };
  }
}

function renderComponent(component: PageComponent, tokens: any, config: TenantConfig) {
  const { type, props } = component;

  switch (type) {
    case 'hero':
      return (
        <div style={{
          background: `linear-gradient(135deg, ${config.uxHints.primaryColor} 0%, ${config.uxHints.primaryColor}dd 100%)`,
          color: 'white',
          padding: '60px 40px',
          borderRadius: tokens.borders.cardRadius,
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            fontFamily: tokens.typography.fontFamily,
            marginBottom: '12px',
          }}>
            {props.title}
          </h1>
          <p style={{
            fontSize: '18px',
            fontFamily: tokens.typography.fontFamily,
            opacity: 0.9,
          }}>
            {props.subtitle}
          </p>
        </div>
      );

    case 'text':
      return (
        <div style={{
          padding: '20px',
          fontSize: props.fontSize || tokens.typography.bodySize,
          fontFamily: tokens.typography.fontFamily,
          color: tokens.colors.textPrimary,
          textAlign: props.alignment || 'left',
        }}>
          {props.content}
        </div>
      );

    case 'flightSearch':
      return (
        <div style={{
          background: tokens.colors.cardBackground,
          padding: tokens.spacing.formPadding,
          borderRadius: tokens.borders.cardRadius,
          boxShadow: tokens.shadows.form,
          border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
        }}>
          <h3 style={{
            fontSize: tokens.typography.headingSize,
            fontWeight: tokens.typography.headingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '16px',
          }}>
            {props.title || 'Search Flights'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: tokens.spacing.formGap,
            marginBottom: '16px',
          }}>
            <FormField label="From" placeholder="JFK" tokens={tokens} />
            <FormField label="To" placeholder="LAX" tokens={tokens} />
            <FormField label="Departure" type="date" tokens={tokens} />
            <FormField label="Return" type="date" tokens={tokens} />
            <FormField label="Passengers" type="number" value="1" tokens={tokens} />
            <FormField label="Cabin Class" type="select" options={['Economy', 'Business', 'First']} tokens={tokens} />
          </div>
          <button style={{
            background: config.uxHints.primaryColor,
            color: 'white',
            padding: tokens.spacing.buttonPadding,
            border: 'none',
            borderRadius: tokens.borders.buttonRadius,
            fontSize: tokens.typography.buttonSize,
            fontWeight: tokens.typography.buttonWeight,
            fontFamily: tokens.typography.fontFamily,
            cursor: 'pointer',
            width: '100%',
          }}>
            {config.uxHints.buttonLabels?.searchFlights || 'Search Flights'}
          </button>
        </div>
      );

    case 'hotelSearch':
      return (
        <div style={{
          background: tokens.colors.cardBackground,
          padding: tokens.spacing.formPadding,
          borderRadius: tokens.borders.cardRadius,
          boxShadow: tokens.shadows.form,
          border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
        }}>
          <h3 style={{
            fontSize: tokens.typography.headingSize,
            fontWeight: tokens.typography.headingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '16px',
          }}>
            {props.title || 'Search Hotels'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: tokens.spacing.formGap,
            marginBottom: '16px',
          }}>
            <FormField label="Location" type="select" options={['New York', 'London', 'Tokyo', 'Paris']} tokens={tokens} />
            <FormField label="Check-in" type="date" tokens={tokens} />
            <FormField label="Check-out" type="date" tokens={tokens} />
            <FormField label="Guests" type="number" value="2" tokens={tokens} />
            <FormField label="Rooms" type="number" value="1" tokens={tokens} />
          </div>
          <button style={{
            background: config.uxHints.primaryColor,
            color: 'white',
            padding: tokens.spacing.buttonPadding,
            border: 'none',
            borderRadius: tokens.borders.buttonRadius,
            fontSize: tokens.typography.buttonSize,
            fontWeight: tokens.typography.buttonWeight,
            fontFamily: tokens.typography.fontFamily,
            cursor: 'pointer',
            width: '100%',
          }}>
            {config.uxHints.buttonLabels?.searchStays || 'Search Hotels'}
          </button>
        </div>
      );

    case 'flightResults':
      return (
        <div>
          <h3 style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '20px',
          }}>
            {props.title || 'Flight Results'}
          </h3>
          {props.layout === 'table' && config.uxHints.layout === 'table' ? (
            <div style={{
              background: tokens.colors.cardBackground,
              padding: '20px',
              borderRadius: tokens.borders.cardRadius,
              boxShadow: tokens.shadows.card,
              color: tokens.colors.textSecondary,
              textAlign: 'center',
            }}>
              Table view - Search for flights to see results
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: tokens.spacing.cardGap,
            }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  background: tokens.colors.cardBackground,
                  padding: tokens.spacing.cardPadding,
                  borderRadius: tokens.borders.cardRadius,
                  boxShadow: tokens.shadows.card,
                  border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
                }}>
                  <div style={{
                    fontSize: tokens.typography.priceSize,
                    fontWeight: tokens.typography.priceWeight,
                    color: config.uxHints.priceEmphasis === 'high' ? config.uxHints.primaryColor : tokens.colors.textPrimary,
                    marginBottom: '8px',
                  }}>
                    ${450 + i * 50}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.bodySize,
                    color: tokens.colors.textSecondary,
                    marginBottom: '12px',
                  }}>
                    Example Airline {i}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: tokens.colors.textPrimary,
                    marginBottom: '8px',
                  }}>
                    JFK → LAX
                  </div>
                  <button style={{
                    width: '100%',
                    padding: tokens.spacing.buttonPadding,
                    background: config.uxHints.primaryColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: tokens.borders.buttonRadius,
                    fontSize: tokens.typography.buttonSize,
                    fontWeight: tokens.typography.buttonWeight,
                    fontFamily: tokens.typography.fontFamily,
                    cursor: 'pointer',
                  }}>
                    {config.uxHints.buttonLabels?.selectFlight || 'Select'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'hotelResults':
      return (
        <div>
          <h3 style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '20px',
          }}>
            {props.title || 'Hotel Results'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: tokens.spacing.cardGap,
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                background: tokens.colors.cardBackground,
                borderRadius: tokens.borders.cardRadius,
                overflow: 'hidden',
                boxShadow: tokens.shadows.card,
                border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
              }}>
                <div style={{
                  height: '180px',
                  background: `linear-gradient(135deg, ${config.uxHints.primaryColor}44 0%, ${config.uxHints.primaryColor}22 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                }}>
                  🏨
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: tokens.colors.textPrimary,
                    marginBottom: '8px',
                  }}>
                    Example Hotel {i}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: tokens.colors.textSecondary,
                    marginBottom: '12px',
                  }}>
                    ⭐⭐⭐⭐ {(4 + i * 0.2).toFixed(1)}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.priceSize,
                    fontWeight: tokens.typography.priceWeight,
                    color: config.uxHints.priceEmphasis === 'high' ? config.uxHints.primaryColor : tokens.colors.textPrimary,
                    marginBottom: '12px',
                  }}>
                    ${200 + i * 100}/night
                  </div>
                  <button style={{
                    width: '100%',
                    padding: tokens.spacing.buttonPadding,
                    background: config.uxHints.primaryColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: tokens.borders.buttonRadius,
                    fontSize: tokens.typography.buttonSize,
                    fontWeight: tokens.typography.buttonWeight,
                    fontFamily: tokens.typography.fontFamily,
                    cursor: 'pointer',
                  }}>
                    {config.uxHints.buttonLabels?.selectStay || 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'twoColumn':
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing.cardGap,
        }}>
          <div style={{
            background: tokens.colors.cardBackground,
            padding: tokens.spacing.cardPadding,
            borderRadius: tokens.borders.cardRadius,
            boxShadow: tokens.shadows.card,
            fontSize: tokens.typography.bodySize,
            fontFamily: tokens.typography.fontFamily,
            color: tokens.colors.textPrimary,
          }}>
            {props.leftContent}
          </div>
          <div style={{
            background: tokens.colors.cardBackground,
            padding: tokens.spacing.cardPadding,
            borderRadius: tokens.borders.cardRadius,
            boxShadow: tokens.shadows.card,
            fontSize: tokens.typography.bodySize,
            fontFamily: tokens.typography.fontFamily,
            color: tokens.colors.textPrimary,
          }}>
            {props.rightContent}
          </div>
        </div>
      );

    case 'spacer':
      return <div style={{ height: props.height || '40px' }} />;

    default:
      return null;
  }
}

// Helper component for form fields
function FormField({ label, placeholder, type = 'text', value, options, tokens }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: tokens.typography.labelSize,
        fontWeight: tokens.typography.labelWeight,
        color: tokens.colors.textSecondary,
      }}>
        {label}
      </label>
      {type === 'select' ? (
        <select style={{
          padding: tokens.spacing.inputPadding,
          fontSize: tokens.typography.bodySize,
          fontFamily: tokens.typography.fontFamily,
          background: tokens.colors.inputBackground,
          color: tokens.colors.textPrimary,
          border: '1px solid ' + tokens.colors.inputBorder,
          borderRadius: tokens.borders.inputRadius,
        }}>
          {options.map((opt: string) => (
            <option key={opt} value={opt.toLowerCase()}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          readOnly
          style={{
            padding: tokens.spacing.inputPadding,
            fontSize: tokens.typography.bodySize,
            fontFamily: tokens.typography.fontFamily,
            background: tokens.colors.inputBackground,
            color: tokens.colors.textPrimary,
            border: '1px solid ' + tokens.colors.inputBorder,
            borderRadius: tokens.borders.inputRadius,
          }}
        />
      )}
    </div>
  );
}

function controlButtonStyle(tokens: any) {
  return {
    padding: '6px 12px',
    background: tokens.colors.textSecondary,
    color: 'white',
    border: 'none',
    borderRadius: tokens.borders.buttonRadius,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: tokens.typography.fontFamily,
  };
}

function adjustColor(color: string, amount: number): string {
  // Simple color darkening (for gradient effect)
  return color; // For simplicity, return same color
}

