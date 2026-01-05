/**
 * Flight Search Form Component
 * Craft.js compatible search form
 */

import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import type { TenantConfig, FlightSearchRequest } from '../../api';
import type { FlightSearchFormProps } from '../../types/pageConfig';

interface FlightSearchFormRuntimeProps extends FlightSearchFormProps {
  config: TenantConfig;
  onSearch: (request: FlightSearchRequest) => Promise<void>;
  loading?: boolean;
}

export function FlightSearchForm({ 
  title, 
  defaultOrigin = 'JFK',
  defaultDestination = 'LAX',
  defaultDepartureDate,
  defaultReturnDate,
  defaultPassengers = 1,
  defaultCabinClass,
  showReturnDate = true,
  showCabinClass = true,
  config, 
  onSearch,
  loading = false 
}: FlightSearchFormRuntimeProps) {
  const { connectors: { connect, drag } } = useNode();
  const tokens = config.uxHints.designTokens;
  // const _isTableLayout = config.uxHints.layout === 'table';

  const [formData, setFormData] = useState<FlightSearchRequest>({
    origin: defaultOrigin,
    destination: defaultDestination,
    departureDate: defaultDepartureDate || getDefaultDate(7),
    returnDate: defaultReturnDate || getDefaultDate(14),
    passengers: defaultPassengers,
    cabinClass: defaultCabinClass || config.flightDefaults.cabinClass,
  });

  // Only sync on initial mount to set defaults from props
  useEffect(() => {
    // Validate dates - if they're in the past, use defaults
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let depDate = defaultDepartureDate || getDefaultDate(7);
    let retDate = defaultReturnDate || getDefaultDate(14);
    
    // If departure date is in the past, reset to default
    if (defaultDepartureDate) {
      const depDateObj = new Date(defaultDepartureDate);
      if (depDateObj < today) {
        depDate = getDefaultDate(7);
      }
    }
    
    // If return date is in the past, reset to default
    if (defaultReturnDate) {
      const retDateObj = new Date(defaultReturnDate);
      if (retDateObj < today) {
        retDate = getDefaultDate(14);
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      // Only update these fields, don't touch origin/destination while user is typing
      departureDate: depDate,
      returnDate: retDate,
      passengers: defaultPassengers,
      cabinClass: defaultCabinClass || config.flightDefaults.cabinClass,
    }));
  }, [defaultDepartureDate, defaultReturnDate, defaultPassengers, defaultCabinClass, config.flightDefaults.cabinClass]);
  
  // Separate effect for origin/destination that only runs on mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      origin: defaultOrigin,
      destination: defaultDestination,
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(formData);
  };

  return (
    <div 
      ref={(ref) => ref && connect(drag(ref))} 
      style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
    >
      {title && (
        <h3 
          className="mb-4 text-center md:text-left"
          style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            fontFamily: tokens.typography.fontFamily,
            color: tokens.colors.textPrimary,
          }}
        >
          {title}
        </h3>
      )}

      <form 
        onSubmit={handleSubmit} 
        className="mb-8 mx-auto"
        style={{
          maxWidth: '100%',
          background: tokens.colors.cardBackground,
          padding: tokens.spacing.formPadding,
          borderRadius: tokens.borders.cardRadius,
          boxShadow: tokens.shadows.form,
          border: tokens.borders.cardBorderWidth !== '0' 
            ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border 
            : 'none',
        }}
      >
        <div 
          className="grid mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          style={{ gap: tokens.spacing.formGap }}
        >
          {/* Origin */}
          <div className="flex flex-col gap-1">
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.colors.textSecondary,
            }}>From</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
              placeholder="JFK"
              maxLength={3}
              required
              className="border"
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          {/* Destination */}
          <div className="flex flex-col gap-1">
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.colors.textSecondary,
            }}>To</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
              placeholder="LAX"
              maxLength={3}
              required
              className="border"
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          {/* Departure Date */}
          <div className="flex flex-col gap-1">
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.colors.textSecondary,
            }}>Departure</label>
            <input
              type="date"
              value={formData.departureDate}
              min={getTodayDate()}
              max={formData.returnDate || undefined}
              onChange={(e) => {
                const newDeparture = e.target.value;
                if (formData.returnDate && newDeparture > formData.returnDate) {
                  setFormData({ ...formData, departureDate: newDeparture, returnDate: newDeparture });
                } else {
                  setFormData({ ...formData, departureDate: newDeparture });
                }
              }}
              required
              className="border"
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          {/* Return Date */}
          {showReturnDate && (
            <div className="flex flex-col gap-1">
              <label style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                fontFamily: tokens.typography.fontFamily,
                color: tokens.colors.textSecondary,
              }}>Return</label>
              <input
                type="date"
                value={formData.returnDate || ''}
                min={formData.departureDate || getTodayDate()}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                className="border"
                style={{
                  padding: tokens.spacing.inputPadding,
                  fontSize: tokens.typography.bodySize,
                  fontWeight: tokens.typography.bodyWeight,
                  fontFamily: tokens.typography.fontFamily,
                  background: tokens.colors.inputBackground,
                  color: tokens.colors.textPrimary,
                  borderColor: tokens.colors.inputBorder,
                  borderRadius: tokens.borders.inputRadius,
                }}
              />
            </div>
          )}

          {/* Passengers */}
          <div className="flex flex-col gap-1">
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.colors.textSecondary,
            }}>Passengers</label>
            <input
              type="number"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
              min={1}
              max={9}
              required
              className="border"
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          {/* Cabin Class */}
          {showCabinClass && (
            <div className="flex flex-col gap-1">
              <label style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                fontFamily: tokens.typography.fontFamily,
                color: tokens.colors.textSecondary,
              }}>Cabin Class</label>
              <select
                value={formData.cabinClass || config.flightDefaults.cabinClass}
                onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value as any })}
                className="border"
                style={{
                  padding: tokens.spacing.inputPadding,
                  fontSize: tokens.typography.bodySize,
                  fontWeight: tokens.typography.bodyWeight,
                  fontFamily: tokens.typography.fontFamily,
                  background: tokens.colors.inputBackground,
                  color: tokens.colors.textPrimary,
                  borderColor: tokens.colors.inputBorder,
                  borderRadius: tokens.borders.inputRadius,
                }}
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`
            cursor-pointer border-none transition-all
            ${config.uxHints.priceEmphasis === 'low' ? 'uppercase tracking-wide' : ''}
            ${loading ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          style={{ 
            background: config.uxHints.primaryColor,
            color: 'white',
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.buttonSize,
            fontWeight: tokens.typography.buttonWeight,
            padding: tokens.spacing.buttonPadding,
            borderRadius: tokens.borders.buttonRadius,
          }}
        >
          {loading ? 'Searching...' : config.uxHints.buttonLabels?.searchFlights || 'Search Flights'}
        </button>
      </form>
    </div>
  );
}

// Craft.js settings
FlightSearchForm.craft = {
  displayName: 'Flight Search Form',
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
  related: {
    settings: FlightSearchFormSettings,
  },
  custom: {
    displayName: 'Flight Search',
  },
};

// Settings panel
function FlightSearchFormSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  // Calculate actual dates being used
  const actualDepartureDate = props.defaultDepartureDate || getDefaultDate(7);
  const actualReturnDate = props.defaultReturnDate || getDefaultDate(14);

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
        💡 These are initial values when the form loads. Users can still change them in the form.
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Title (optional)
        </label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((props: FlightSearchFormProps) => (props.title = e.target.value))}
          placeholder="Leave empty for no title"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Default Origin (Airport Code)
        </label>
        <input
          type="text"
          value={props.defaultOrigin || ''}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setProp((props: FlightSearchFormProps) => (props.defaultOrigin = value));
          }}
          maxLength={3}
          placeholder="JFK"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            textTransform: 'uppercase',
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Default Destination (Airport Code)
        </label>
        <input
          type="text"
          value={props.defaultDestination || ''}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setProp((props: FlightSearchFormProps) => (props.defaultDestination = value));
          }}
          maxLength={3}
          placeholder="LAX"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            textTransform: 'uppercase',
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Default Departure Date
        </label>
        <input
          type="date"
          value={props.defaultDepartureDate || actualDepartureDate}
          min={getMinDate()}
          max={props.defaultReturnDate || actualReturnDate}
          onChange={(e) => {
            const newDate = e.target.value;
            const retDate = props.defaultReturnDate || actualReturnDate;
            // Validate: must be in the future
            if (newDate && new Date(newDate) < new Date(getMinDate())) {
              alert('Departure date must be at least 1 day in the future');
              return;
            }
            // Validate: can't be after return date
            if (newDate && new Date(newDate) >= new Date(retDate)) {
              alert('Departure date must be before return date');
              return;
            }
            setProp((props: FlightSearchFormProps) => {
              props.defaultDepartureDate = newDate;
            });
          }}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        {!props.defaultDepartureDate && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
            Auto: 7 days from today
          </div>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Default Return Date
        </label>
        <input
          type="date"
          value={props.defaultReturnDate || actualReturnDate}
          min={props.defaultDepartureDate || actualDepartureDate}
          onChange={(e) => {
            const newDate = e.target.value;
            const depDate = props.defaultDepartureDate || actualDepartureDate;
            // Validate: must be after departure date
            if (newDate && new Date(newDate) <= new Date(depDate)) {
              alert('Return date must be after departure date');
              return;
            }
            setProp((props: FlightSearchFormProps) => (props.defaultReturnDate = newDate));
          }}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        {!props.defaultReturnDate && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
            Auto: 14 days from today
          </div>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Default Passengers
        </label>
        <input
          type="number"
          value={props.defaultPassengers || 1}
          onChange={(e) => setProp((props: FlightSearchFormProps) => (props.defaultPassengers = parseInt(e.target.value)))}
          min={1}
          max={9}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 600 }}>
          Default Cabin Class
        </label>
        <select
          value={props.defaultCabinClass || 'economy'}
          onChange={(e) => setProp((props: FlightSearchFormProps) => (props.defaultCabinClass = e.target.value as any))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>
      </div>

      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={props.showReturnDate !== false}
            onChange={(e) => setProp((props: FlightSearchFormProps) => (props.showReturnDate = e.target.checked))}
            style={{ marginRight: '8px' }}
          />
          Show Return Date Field
        </label>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={props.showCabinClass !== false}
            onChange={(e) => setProp((props: FlightSearchFormProps) => (props.showCabinClass = e.target.checked))}
            style={{ marginRight: '8px' }}
          />
          Show Cabin Class Field
        </label>
      </div>
    </div>
  );
}

function getDefaultDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]!;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]!;
}

function getMinDate(): string {
  // Minimum date is tomorrow (to ensure flight searches work)
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0]!;
}

