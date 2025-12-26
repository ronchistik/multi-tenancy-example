/**
 * Page Editor
 * Visual page editor using Craft.js
 */

import React, { useState, useMemo, useRef, createContext, useContext } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import type { TenantConfig, FlightSearchRequest, FlightOffer, PageConfig, ThemeOverrides } from '../api';
import { applyThemeOverrides, extractThemeOverrides } from '../utils/themeUtils';
import { ThemeEditor } from '../components/ThemeEditor';
import { RenderNode } from '../components/RenderNode';

// Import all components that can be used in pages
import { Container } from '../components/Page/Container';
import { PageTitle } from '../components/Page/PageTitle';
import { FlightSearchForm } from '../components/Page/FlightSearchForm';
import { FlightResults } from '../components/Page/FlightResults';
import { Text } from '../components/Page/Text';
import { Button } from '../components/Page/Button';
import { Divider } from '../components/Page/Divider';
import { Spacer } from '../components/Page/Spacer';
import { FeatureCardsEditable } from '../components/Page/FeatureCardsEditable';

// Runtime props context
const RuntimePropsContext = createContext<any>(null);

// Wrapper components that inject runtime props
function ContainerWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <Container {...props} config={runtime?.config} />;
}
ContainerWithProps.craft = { ...Container.craft };

function PageTitleWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <PageTitle {...props} config={runtime?.config} />;
}
PageTitleWithProps.craft = { ...PageTitle.craft };

function FlightSearchFormWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <FlightSearchForm {...props} config={runtime?.config} onSearch={runtime?.onFlightSearch} loading={runtime?.flightLoading} />;
}
FlightSearchFormWithProps.craft = { ...FlightSearchForm.craft };

function FlightResultsWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <FlightResults {...props} config={runtime?.config} offers={runtime?.flightOffers} error={runtime?.flightError} loading={runtime?.flightLoading} hasSearched={runtime?.hasSearched} isEditor={true} />;
}
FlightResultsWithProps.craft = { ...FlightResults.craft };

// Basic component wrappers
function TextWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <Text {...props} config={runtime?.config} />;
}
TextWithProps.craft = { ...Text.craft };

function ButtonWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <Button {...props} config={runtime?.config} />;
}
ButtonWithProps.craft = { ...Button.craft };

function DividerWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <Divider {...props} config={runtime?.config} />;
}
DividerWithProps.craft = { ...Divider.craft };

function SpacerWithProps(props: any) {
  return <Spacer {...props} />;
}
SpacerWithProps.craft = { ...Spacer.craft };

function FeatureCardsWithProps(props: any) {
  const runtime = useContext(RuntimePropsContext);
  return <FeatureCardsEditable {...props} config={runtime?.config} />;
}
FeatureCardsWithProps.craft = { ...FeatureCardsEditable.craft };

interface PageEditorProps {
  pageConfig: PageConfig;
  config: TenantConfig;
  initialThemeOverrides?: ThemeOverrides; // Tenant-level theme overrides
  onSave: (serializedState: string, themeOverrides?: ThemeOverrides) => void;
  onClose: () => void;
}

export function PageEditor({ pageConfig, config: baseConfig, initialThemeOverrides, onSave, onClose }: PageEditorProps) {
  // State for flight results (for preview)
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // State for theme overrides (use tenant-level theme, not page-level)
  const [themeOverrides, setThemeOverrides] = useState<ThemeOverrides | undefined>(initialThemeOverrides);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  
  // Apply theme overrides to get active config
  const config = useMemo(
    () => applyThemeOverrides(baseConfig, themeOverrides),
    [baseConfig, themeOverrides]
  );

  // Mock flight search for preview
  const handleFlightSearch = async (request: FlightSearchRequest) => {
    setFlightLoading(true);
    setFlightError(null);
    setHasSearched(true);
    // Mock data for preview
    setTimeout(() => {
      setFlightOffers([]);
      setFlightLoading(false);
    }, 1000);
  };
  
  // Handle theme changes
  const handleThemeChange = (newConfig: TenantConfig) => {
    const overrides = extractThemeOverrides(baseConfig, newConfig);
    setThemeOverrides(overrides);
  };

  // Resolver uses wrapped components with context
  const resolver = {
    Container: ContainerWithProps,
    PageTitle: PageTitleWithProps,
    FlightSearchForm: FlightSearchFormWithProps,
    FlightResults: FlightResultsWithProps,
    Text: TextWithProps,
    Button: ButtonWithProps,
    Divider: DividerWithProps,
    Spacer: SpacerWithProps,
    FeatureCards: FeatureCardsWithProps,
  };

  // Runtime props for context
  const runtimeProps = {
    config,
    onFlightSearch: handleFlightSearch,
    flightOffers,
    flightLoading,
    flightError,
    hasSearched,
  };

  // Parse the serialized state and inject FeatureCards if tenant has them
  // Use a stable key based on the original pageConfig to prevent re-injection during editing
  const pageConfigKey = useRef(pageConfig.serializedState);
  const injectedState = useRef<any>(null);
  
  // Reset cache if pageConfig changes (different page/tenant)
  if (pageConfigKey.current !== pageConfig.serializedState) {
    pageConfigKey.current = pageConfig.serializedState;
    injectedState.current = null;
  }
  
  const serializedState = useMemo(() => {
    // Return cached state if already computed for this pageConfig
    if (injectedState.current !== null) {
      return injectedState.current;
    }
    
    // Safety check for undefined serializedState
    if (!pageConfig.serializedState) {
      console.error('pageConfig.serializedState is undefined!', pageConfig);
      return {};
    }
    
    const state = JSON.parse(pageConfig.serializedState);
    
    // Check if tenant has featureCards and page doesn't have FeatureCards component
    const hasFeatureCardsInTenant = baseConfig.uxHints.featureCards && baseConfig.uxHints.featureCards.length > 0;
    const hasFeatureCardsInPage = Object.values(state).some(
      (node: any) => node.type?.resolvedName === 'FeatureCards'
    );
    
    // Inject FeatureCards at the beginning if tenant has them but page doesn't
    if (hasFeatureCardsInTenant && !hasFeatureCardsInPage) {
      const featureCardsId = 'injected-feature-cards';
      
      // Add FeatureCards node
      state[featureCardsId] = {
        type: { resolvedName: 'FeatureCards' },
        isCanvas: false,
        props: {
          cards: baseConfig.uxHints.featureCards,
        },
        displayName: 'Feature Cards',
        custom: {},
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      };
      
      // Add to ROOT's nodes at the beginning
      if (state.ROOT && Array.isArray(state.ROOT.nodes)) {
        state.ROOT.nodes = [featureCardsId, ...state.ROOT.nodes];
      }
    }
    
    injectedState.current = state;
    return state;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageConfig.serializedState, baseConfig.id]); // Reset when page or tenant changes

  return (
    <RuntimePropsContext.Provider value={runtimeProps}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '12px 20px',
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
          🎨 Page Editor - {pageConfig.name}
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowThemeEditor(!showThemeEditor)}
            style={{
              padding: '8px 16px',
              background: showThemeEditor ? baseConfig.uxHints.primaryColor : '#f3f4f6',
              color: showThemeEditor ? 'white' : '#374151',
              border: showThemeEditor ? 'none' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🎨 Theme {themeOverrides && Object.keys(themeOverrides).length > 0 && '●'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

        {/* Editor */}
        <Editor
          resolver={resolver}
          enabled={true} // Editable mode
          onRender={RenderNode}
        >
          <style>{`
            .component-selected {
              outline: 2px dashed #2563eb !important;
              outline-offset: 2px;
            }
          `}</style>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Panel - Component Toolbox or Theme Editor */}
            {showThemeEditor ? (
              <div style={{
                width: '300px',
                background: 'white',
                borderRight: '1px solid #e0e0e0',
                padding: '20px',
                overflow: 'auto',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                  Theme Customization
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                  Theme changes apply to all pages for this tenant. Green dot ● = overridden.
                </p>
                <ThemeEditor
                  baseConfig={baseConfig}
                  currentConfig={config}
                  onChange={handleThemeChange}
                />
              </div>
            ) : (
              <Toolbox config={baseConfig} />
            )}

            {/* Center Panel - Canvas with Preview */}
            <div style={{
              flex: 1,
              background: '#e5e7eb',
              overflow: 'auto',
              padding: '20px',
            }}>
              {/* Preview container that mimics actual page */}
              <div style={{
                background: config.uxHints.designTokens.colors.background,
                minHeight: 'calc(100vh - 140px)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}>
                {/* Header Preview */}
                <header style={{ 
                  color: 'white',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  ...(config.uxHints.backgroundImage ? {
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  } : {
                    padding: config.uxHints.layout === 'table' ? '12px 20px' : '28px 20px',
                    background: config.uxHints.primaryColor,
                    boxShadow: config.uxHints.layout === 'table' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }),
                }}>
                  {/* Background image */}
                  {config.uxHints.backgroundImage && (
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
                  
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    padding: config.uxHints.backgroundImage ? '30px 20px' : '0',
                  }}>
                    <h1 style={{
                      fontSize: config.uxHints.backgroundImage ? '32px' : config.uxHints.designTokens.typography.headingSize,
                      fontWeight: config.uxHints.designTokens.typography.headingWeight,
                      fontFamily: config.uxHints.designTokens.typography.fontFamily,
                      marginBottom: config.uxHints.backgroundImage ? '8px' : '4px',
                      letterSpacing: config.uxHints.priceEmphasis === 'low' ? '3px' : '1px',
                      textTransform: config.uxHints.priceEmphasis === 'low' ? 'uppercase' : 'none',
                      textShadow: config.uxHints.backgroundImage ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
                    }}>
                      {config.uxHints.brandName}
                    </h1>
                    {(config.uxHints.layout !== 'table' || config.uxHints.backgroundImage) && (
                      <p style={{
                        fontSize: config.uxHints.backgroundImage ? '16px' : config.uxHints.designTokens.typography.bodySize,
                        fontFamily: config.uxHints.designTokens.typography.fontFamily,
                        opacity: 0.9,
                        margin: 0,
                        textShadow: config.uxHints.backgroundImage ? '0 1px 10px rgba(0,0,0,0.5)' : 'none',
                        fontWeight: 300,
                      }}>
                        {config.uxHints.tagline || 'Multi-Tenant Travel Platform Demo'}
                      </p>
                    )}
                  </div>
                </header>
                
                {/* Page Content - FeatureCards are editable inside the canvas */}
                <main style={{
                  padding: '20px',
                  maxWidth: config.uxHints.layout === 'table' ? '1600px' : '1200px',
                  margin: '0 auto',
                  fontFamily: config.uxHints.designTokens.typography.fontFamily,
                  color: config.uxHints.designTokens.colors.textPrimary,
                }}>
                  <Frame data={serializedState}>
                    <Element is={ContainerWithProps} canvas padding="20px" />
                  </Frame>
                </main>
              </div>
            </div>

            {/* Right Panel - Settings */}
            <SettingsPanel 
              onSave={onSave} 
              {...(themeOverrides ? { themeOverrides } : {})}
            />
          </div>
        </Editor>
      </div>
    </RuntimePropsContext.Provider>
  );
}

/**
 * Component Toolbox
 */
function Toolbox({ config }: { config: TenantConfig }) {
  const { connectors } = useEditor();
  const tokens = config.uxHints.designTokens;

  const mainComponents = [
    { name: 'Page Title', component: PageTitleWithProps, enabled: true },
    { name: 'Flight Search', component: FlightSearchFormWithProps, enabled: config.enabledVerticals.includes('flights') },
    { name: 'Flight Results', component: FlightResultsWithProps, enabled: config.enabledVerticals.includes('flights') },
    { name: 'Feature Cards', component: FeatureCardsWithProps, enabled: true },
    { name: 'Container', component: ContainerWithProps, enabled: true },
  ].filter(c => c.enabled);

  const basicComponents = [
    { name: 'Text', component: TextWithProps },
    { name: 'Button', component: ButtonWithProps },
    { name: 'Divider', component: DividerWithProps },
    { name: 'Spacer', component: SpacerWithProps },
  ];

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
    marginTop: '20px',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: '6px',
    padding: '10px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'grab',
    fontSize: '13px',
    fontWeight: 500,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={{
      width: '250px',
      background: '#fff',
      borderRight: '1px solid #e5e7eb',
      padding: '16px',
      overflow: 'auto',
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '4px',
      }}>
        Components
      </h3>
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        Drag to add to page
      </p>

      {/* Main Components */}
      <div style={sectionTitleStyle}>Main Components</div>
      {mainComponents.map(({ name, component }) => (
        <button
          key={name}
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, React.createElement(component));
            }
          }}
          style={{
            ...buttonStyle,
            background: config.uxHints.primaryColor,
          }}
        >
          <span style={{ opacity: 0.7 }}>+</span> {name}
        </button>
      ))}

      {/* Basic Components */}
      <div style={sectionTitleStyle}>Basic Components</div>
      {basicComponents.map(({ name, component }) => (
        <button
          key={name}
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, React.createElement(component));
            }
          }}
          style={{
            ...buttonStyle,
            background: '#6b7280',
          }}
        >
          <span style={{ opacity: 0.7 }}>+</span> {name}
        </button>
      ))}
    </div>
  );
}

/**
 * Settings Panel
 */
function SettingsPanel({ onSave, themeOverrides }: { onSave: (serializedState: string, themeOverrides?: ThemeOverrides) => void; themeOverrides?: ThemeOverrides }) {
  const { actions, selected, query } = useEditor((state, query) => {
    const currentlySelected = query.getEvent('selected').first();
    return {
      selected: currentlySelected,
      query,
    };
  });

  const handleSave = () => {
    const serialized = query.serialize();
    onSave(serialized, themeOverrides);
    // Alert handled by parent (App.tsx) with proper success/error feedback
  };

  return (
    <div style={{
      width: '300px',
      background: 'white',
      borderLeft: '1px solid #e0e0e0',
      padding: '20px',
      overflow: 'auto',
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '16px',
      }}>
        Settings
      </h3>

      {selected ? (
        <ComponentSettings />
      ) : (
        <div style={{ color: '#666', fontSize: '14px' }}>
          Select a component to edit its settings
        </div>
      )}

      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '12px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        💾 Save Page
      </button>

      <button
        onClick={() => actions.history.undo()}
        style={{
          width: '100%',
          padding: '10px',
          background: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          marginTop: '8px',
        }}
      >
        ↶ Undo
      </button>

      <button
        onClick={() => actions.history.redo()}
        style={{
          width: '100%',
          padding: '10px',
          background: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          marginTop: '8px',
        }}
      >
        ↷ Redo
      </button>
    </div>
  );
}

/**
 * Component Settings
 * Renders the settings panel for the selected component
 */
function ComponentSettings() {
  const { selected } = useEditor((state, query) => {
    const currentlySelected = query.getEvent('selected').first();
    const node = currentlySelected ? state.nodes[currentlySelected] : null;
    return {
      selected: node
        ? {
            id: currentlySelected!,
            name: node.data.displayName,
            settings: node.related?.settings,
          }
        : null,
    };
  });

  if (!selected) return null;

  return (
    <div>
      <div style={{
        padding: '8px',
        background: '#f3f4f6',
        borderRadius: '4px',
        marginBottom: '12px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#374151',
      }}>
        {selected?.name || 'Component'}
      </div>
      {selected?.settings && React.createElement(selected.settings)}
    </div>
  );
}

