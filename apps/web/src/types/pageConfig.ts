/**
 * Page Configuration Types
 * Defines JSON structure for dynamic page rendering
 */

export type ComponentType =
  | 'Container'
  | 'PageTitle'
  | 'FlightSearchForm'
  | 'FlightResults'
  | 'StaySearchForm'
  | 'StayResults'
  | 'HeroBlock'
  | 'TextBlock'
  | 'Spacer';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  props?: Record<string, any>;
  children?: string[]; // IDs of child components
}

export interface PageConfig {
  id: string;
  name: string;
  root: string; // ID of root component
  components: Record<string, BaseComponent>;
}

// Specific component prop types
export interface PageTitleProps {
  text?: string; // If not provided, uses tenant default
  align?: 'left' | 'center' | 'right';
}

export interface FlightSearchFormProps {
  title?: string;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDepartureDate?: string;
  defaultReturnDate?: string;
  defaultPassengers?: number;
  defaultCabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  showReturnDate?: boolean;
  showCabinClass?: boolean;
}

export interface FlightResultsProps {
  title?: string;
  emptyMessage?: string;
}

export interface HeroBlockProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export interface TextBlockProps {
  content: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: string;
}

export interface SpacerProps {
  height: string;
}

