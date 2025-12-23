/**
 * Default page configurations for tenants
 * These are Craft.js serialized states
 */

import type { PageConfig } from '../tenant/tenant.types.js';

/**
 * Create default FlightsPage config
 * This defines the component tree: PageTitle -> FlightSearchForm -> FlightResults
 */
export function createDefaultFlightsPage(): PageConfig {
  return {
    id: 'flights-page',
    name: 'Flights Page',
    // Craft.js serialized state
    serializedState: JSON.stringify({
      ROOT: {
        type: { resolvedName: 'Container' },
        isCanvas: true,
        props: { padding: '0' },
        displayName: 'Container',
        custom: {},
        hidden: false,
        nodes: ['page-title', 'search-form', 'results'],
        linkedNodes: {},
      },
      'page-title': {
        type: { resolvedName: 'PageTitle' },
        isCanvas: false,
        props: {
          text: 'Search Flights',
          align: 'left',
        },
        displayName: 'Page Title',
        custom: {},
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
      'search-form': {
        type: { resolvedName: 'FlightSearchForm' },
        isCanvas: false,
        props: {
          title: '',
          defaultOrigin: 'JFK',
          defaultDestination: 'LAX',
          defaultDepartureDate: '',
          defaultReturnDate: '',
          defaultPassengers: 1,
          defaultCabinClass: 'economy',
          showReturnDate: true,
          showCabinClass: true,
        },
        displayName: 'Flight Search Form',
        custom: {},
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
      'results': {
        type: { resolvedName: 'FlightResults' },
        isCanvas: false,
        props: {
          title: '',
          emptyMessage: 'No flights found. Try a different search.',
        },
        displayName: 'Flight Results',
        custom: {},
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    }),
  };
}

/**
 * Create default StaysPage config
 * TODO: Implement when StaysPage components are created
 */
export function createDefaultStaysPage(): PageConfig {
  return {
    id: 'stays-page',
    name: 'Stays Page',
    serializedState: JSON.stringify({
      ROOT: {
        type: { resolvedName: 'Container' },
        isCanvas: true,
        props: { padding: '0' },
        displayName: 'Container',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    }),
  };
}

