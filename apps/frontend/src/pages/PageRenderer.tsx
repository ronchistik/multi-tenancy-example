/**
 * Page Renderer
 * Renders pages from JSON config using Craft.js
 */

import React, { useState, useMemo, createContext, useContext } from 'react';
import { Editor, Frame } from '@craftjs/core';
import type { TenantConfig, FlightSearchRequest, FlightOffer, PageConfig } from '../api';
import { applyThemeOverrides } from '../utils/themeUtils';

// Import all components that can be used in pages
import { Container } from '../components/ui/Container';
import { PageTitle } from '../components/ui/PageTitle';
import { FlightSearchForm } from '../components/flights/FlightSearchForm';
import { FlightResults } from '../components/flights/FlightResults';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { Divider } from '../components/ui/Divider';
import { Spacer } from '../components/ui/Spacer';
import { FeatureCardsEditable } from '../components/features/FeatureCardsEditable';

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

interface PageRendererProps {
  pageConfig: PageConfig;
  config: TenantConfig;
  onFlightSearch?: (request: FlightSearchRequest) => Promise<{ offers: FlightOffer[] }>;
}

export function PageRenderer({ pageConfig, config: baseConfig, onFlightSearch }: PageRendererProps) {
  // Apply theme overrides
  const config = useMemo(
    () => applyThemeOverrides(baseConfig, pageConfig.themeOverrides),
    [baseConfig, pageConfig.themeOverrides]
  );
  
  // State for flight results
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle flight search
  const handleFlightSearch = async (request: FlightSearchRequest) => {
    if (!onFlightSearch) return;
    
    setFlightLoading(true);
    setFlightError(null);
    setHasSearched(true);
    try {
      const result = await onFlightSearch(request);
      setFlightOffers(result.offers);
    } catch (err) {
      setFlightError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setFlightLoading(false);
    }
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

  // Parse the serialized state
  const serializedState = JSON.parse(pageConfig.serializedState);

  return (
    <RuntimePropsContext.Provider value={runtimeProps}>
      <Editor
        resolver={resolver}
        enabled={false} // Read-only mode (not editable)
      >
        <Frame data={serializedState} />
      </Editor>
    </RuntimePropsContext.Provider>
  );
}

