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
  
  // State for functional components
  const [flightResults, setFlightResults] = useState<FlightOffer[]>([]);
  const [hotelResults, setHotelResults] = useState<StayOffer[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);

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
              {renderComponent(component, tokens, config, {
                flightResults,
                hotelResults,
                loadingFlights,
                loadingHotels,
                onFlightSearch: async (req: any) => {
                  if (!onFlightSearch) return;
                  setLoadingFlights(true);
                  try {
                    const result = await onFlightSearch(req);
                    setFlightResults(result.offers);
                  } finally {
                    setLoadingFlights(false);
                  }
                },
                onStaySearch: async (req: any) => {
                  if (!onStaySearch) return;
                  setLoadingHotels(true);
                  try {
                    const result = await onStaySearch(req);
                    setHotelResults(result.stays);
                  } finally {
                    setLoadingHotels(false);
                  }
                },
                locations,
                config,
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Builder Mode
  return (
    <div style={{ padding: '20px' }}>
      {/* Demo Notice */}
      <div style={{
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
          📝 Page Builder - Demo Feature
        </div>
        <div style={{ fontSize: '14px', color: '#78350f', marginBottom: '8px' }}>
          This demonstrates how the multi-tenant platform can support custom page layouts.
          The builder shows design token integration but is not fully functional for production use.
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: '#92400e', 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #f59e0b55',
        }}>
          <strong>Note:</strong> Tenant permissions and rules still apply - disabled verticals and policies remain enforced.
        </div>
      </div>

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
        
        {(['hero', 'flightSearch', 'hotelSearch', 'flightResults', 'hotelResults', 'text', 'twoColumn', 'spacer'] as ComponentType[]).map((type) => {
          // Check if vertical is enabled
          const isHotelComponent = type === 'hotelSearch' || type === 'hotelResults';
          const isFlightComponent = type === 'flightSearch' || type === 'flightResults';
          const isDisabled = 
            (isHotelComponent && !config.enabledVerticals.includes('stays')) ||
            (isFlightComponent && !config.enabledVerticals.includes('flights'));

          return (
            <button
              key={type}
              onClick={() => !isDisabled && addComponent(type)}
              disabled={isDisabled}
              style={{
                width: '100%',
                marginBottom: '8px',
                padding: '10px',
                background: isDisabled ? '#d1d5db' : config.uxHints.primaryColor,
                color: isDisabled ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: tokens.borders.buttonRadius,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontSize: tokens.typography.bodySize,
                fontFamily: tokens.typography.fontFamily,
                opacity: isDisabled ? 0.6 : 1,
              }}
              title={isDisabled ? `${isHotelComponent ? 'Hotels' : 'Flights'} are disabled for this tenant` : ''}
            >
              + {formatComponentName(type)}
              {isDisabled && ' (disabled)'}
            </button>
          );
        })}

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

function renderComponent(component: PageComponent, tokens: any, config: TenantConfig, runtime?: any) {
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
      return <FlightSearchComponent tokens={tokens} config={config} onSearch={runtime?.onFlightSearch} loading={runtime?.loadingFlights} />;
    
    case 'hotelSearch':
      return <HotelSearchComponent tokens={tokens} config={config} locations={runtime?.locations || []} onSearch={runtime?.onStaySearch} loading={runtime?.loadingHotels} />;
    
    case 'flightResults':
      if (!runtime?.flightResults || runtime.flightResults.length === 0) {
        return (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: tokens.colors.cardBackground,
            borderRadius: tokens.borders.cardRadius,
            color: tokens.colors.textSecondary,
          }}>
            Use Flight Search component above to see results here
          </div>
        );
      }
      return (
        <div>
          <h3 style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '20px',
          }}>
            {runtime.flightResults.length} Flights Found
          </h3>
          {config.uxHints.layout === 'table' ? (
            <FlightTable offers={runtime.flightResults} config={config} />
          ) : (
            <FlightCards offers={runtime.flightResults} config={config} />
          )}
        </div>
      );
    
    case 'hotelResults':
      if (!runtime?.hotelResults || runtime.hotelResults.length === 0) {
        return (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: tokens.colors.cardBackground,
            borderRadius: tokens.borders.cardRadius,
            color: tokens.colors.textSecondary,
          }}>
            Use Hotel Search component above to see results here
          </div>
        );
      }
      return (
        <div>
          <h3 style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '20px',
          }}>
            {runtime.hotelResults.length} Hotels Found
          </h3>
          {config.uxHints.layout === 'table' ? (
            <StayTable stays={runtime.hotelResults} config={config} />
          ) : (
            <StayCards stays={runtime.hotelResults} config={config} />
          )}
        </div>
      );

    case 'hotelSearch':
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

// Functional Flight Search Component
function FlightSearchComponent({ tokens, config, onSearch, loading }: any) {
  const [formData, setFormData] = React.useState({
    origin: 'JFK',
    destination: 'LAX',
    departureDate: getDefaultDate(7),
    returnDate: getDefaultDate(14),
    passengers: 1,
    cabinClass: config.flightDefaults.cabinClass,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      await onSearch(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
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
        Search Flights
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: tokens.spacing.formGap,
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            From
          </label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
            maxLength={3}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            To
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
            maxLength={3}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Departure
          </label>
          <input
            type="date"
            value={formData.departureDate}
            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Return
          </label>
          <input
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Passengers
          </label>
          <input
            type="number"
            value={formData.passengers}
            onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
            min={1}
            max={9}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
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
        }}
      >
        {loading ? 'Searching...' : config.uxHints.buttonLabels?.searchFlights || 'Search Flights'}
      </button>
    </form>
  );
}

// Functional Hotel Search Component
function HotelSearchComponent({ tokens, config, locations, onSearch, loading }: any) {
  const [formData, setFormData] = React.useState({
    locationId: locations[0]?.id || 'nyc',
    checkInDate: getDefaultDate(7),
    checkOutDate: getDefaultDate(10),
    guests: 2,
    rooms: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if stays is enabled
    if (!config.enabledVerticals.includes('stays')) {
      alert('Hotels are not available for ' + config.uxHints.brandName);
      return;
    }
    if (onSearch) {
      await onSearch(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
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
        Search Hotels
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: tokens.spacing.formGap,
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Location
          </label>
          <select
            value={formData.locationId}
            onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          >
            {locations.map((loc: Location) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Check-in
          </label>
          <input
            type="date"
            value={formData.checkInDate}
            onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Check-out
          </label>
          <input
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Guests
          </label>
          <input
            type="number"
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
            min={1}
            max={10}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: tokens.typography.labelSize, fontWeight: tokens.typography.labelWeight, color: tokens.colors.textSecondary }}>
            Rooms
          </label>
          <input
            type="number"
            value={formData.rooms}
            onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
            min={1}
            max={5}
            required
            style={{ padding: tokens.spacing.inputPadding, fontSize: tokens.typography.bodySize, fontFamily: tokens.typography.fontFamily, background: tokens.colors.inputBackground, color: tokens.colors.textPrimary, border: '1px solid ' + tokens.colors.inputBorder, borderRadius: tokens.borders.inputRadius }}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
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
        }}
      >
        {loading ? 'Searching...' : config.uxHints.buttonLabels?.searchStays || 'Search Hotels'}
      </button>
    </form>
  );
}

function getDefaultDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]!;
}

