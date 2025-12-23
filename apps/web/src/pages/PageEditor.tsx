/**
 * Page Editor
 * Visual page editor using Craft.js
 */

import React, { useState, useMemo, createContext, useContext } from 'react';
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
  return <FlightResults {...props} config={runtime?.config} offers={runtime?.flightOffers} error={runtime?.flightError} loading={runtime?.flightLoading} hasSearched={runtime?.hasSearched} />;
}
FlightResultsWithProps.craft = { ...FlightResults.craft };

interface PageEditorProps {
  pageConfig: PageConfig;
  config: TenantConfig;
  onSave: (serializedState: string, themeOverrides?: ThemeOverrides) => void;
  onClose: () => void;
}

export function PageEditor({ pageConfig, config: baseConfig, onSave, onClose }: PageEditorProps) {
  // State for flight results (for preview)
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // State for theme overrides
  const [themeOverrides, setThemeOverrides] = useState<ThemeOverrides | undefined>(pageConfig.themeOverrides);
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

  // Parse the serialized state
  const serializedState = JSON.parse(pageConfig.serializedState);

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
              background: showThemeEditor ? config.uxHints.primaryColor : '#f3f4f6',
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
                  These changes only affect this page. Green dot ● = overridden.
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

            {/* Center Panel - Canvas */}
            <div style={{
              flex: 1,
              background: '#f5f5f5',
              overflow: 'auto',
              padding: '20px',
            }}>
              <Frame data={serializedState}>
                <Element is={ContainerWithProps} canvas padding="20px" />
              </Frame>
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
  const { connectors, query } = useEditor();
  const tokens = config.uxHints.designTokens;

  const components = [
    { name: 'Page Title', component: PageTitleWithProps, enabled: true },
    { name: 'Flight Search', component: FlightSearchFormWithProps, enabled: config.enabledVerticals.includes('flights') },
    { name: 'Flight Results', component: FlightResultsWithProps, enabled: config.enabledVerticals.includes('flights') },
    { name: 'Container', component: ContainerWithProps, enabled: true },
  ].filter(c => c.enabled);

  return (
    <div style={{
      width: '250px',
      background: tokens.colors.cardBackground,
      borderRight: '1px solid ' + tokens.colors.border,
      padding: '20px',
      overflow: 'auto',
    }}>
      <h3 style={{
        fontSize: tokens.typography.subheadingSize,
        fontWeight: tokens.typography.subheadingWeight,
        color: tokens.colors.textPrimary,
        marginBottom: '16px',
      }}>
        Components
      </h3>

      {components.map(({ name, component }) => (
        <button
          key={name}
          ref={(ref) => {
            if (ref) {
              connectors.create(
                ref,
                React.createElement(component)
              );
            }
          }}
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
            textAlign: 'left',
          }}
        >
          + {name}
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
    alert('Page saved! (In production, this would save to the backend)');
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

