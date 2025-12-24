/**
 * Flights search page
 */

import React, { useState } from 'react';
import type { TenantConfig, FlightSearchRequest, FlightOffer } from '../api';
import { FlightCards } from '../components/Flights/FlightCards';
import { FlightTable } from '../components/Flights/FlightTable';

interface FlightsPageProps {
  config: TenantConfig;
  onSearch: (request: FlightSearchRequest) => Promise<{ offers: FlightOffer[] }>;
}

export function FlightsPage({ config, onSearch }: FlightsPageProps) {
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FlightSearchRequest>({
    origin: 'JFK',
    destination: 'LAX',
    departureDate: getDefaultDate(7),
    returnDate: getDefaultDate(14),
    passengers: 1,
    cabinClass: config.flightDefaults.cabinClass,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await onSearch(formData);
      setOffers(result.offers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const isTableLayout = config.uxHints.layout === 'table';
  const tokens = config.uxHints.designTokens;

  return (
    <div style={{ width: '100%', maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}>
      <h2 
        className="mb-6 text-center md:text-left"
        style={{
          fontSize: tokens.typography.headingSize,
          fontWeight: tokens.typography.headingWeight,
          color: tokens.colors.textPrimary,
        }}
      >
        {config.uxHints.priceEmphasis === 'low' ? 'Search Premium Flights' : 'Search Flights'}
      </h2>

      <form 
        onSubmit={handleSearch} 
        className="mb-8 mx-auto"
        style={{
          maxWidth: '100%',
          background: tokens.colors.cardBackground,
          padding: tokens.spacing.formPadding,
          borderRadius: tokens.borders.cardRadius,
          boxShadow: tokens.shadows.form,
          border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
        }}
      >
        <div 
          className="grid mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          style={{ gap: tokens.spacing.formGap }}
        >
          <div className="flex flex-col gap-1">
            <label 
              style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                color: tokens.colors.textSecondary,
              }}
            >
              From
            </label>
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
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label 
              style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                color: tokens.colors.textSecondary,
              }}
            >
              To
            </label>
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
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label 
              style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                color: tokens.colors.textSecondary,
              }}
            >
              Departure
            </label>
            <input
              type="date"
              value={formData.departureDate}
              min={getMinDate()}
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
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label 
              style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                color: tokens.colors.textSecondary,
              }}
            >
              Return
            </label>
            <input
              type="date"
              value={formData.returnDate || ''}
              min={formData.departureDate || getMinDate()}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              className="border"
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label 
              style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                color: tokens.colors.textSecondary,
              }}
            >
              Passengers
            </label>
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
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label 
              style={{
                fontSize: tokens.typography.labelSize,
                fontWeight: tokens.typography.labelWeight,
                color: tokens.colors.textSecondary,
              }}
            >
              Cabin Class
            </label>
            <select
              value={formData.cabinClass || config.flightDefaults.cabinClass}
              onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value as any })}
              className="border"
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`
            cursor-pointer border-none transition-all
            ${config.uxHints.priceEmphasis === 'low' ? 'uppercase tracking-wide' : ''}
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
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

      {error && (
        <div 
          className="p-4 mb-5 max-w-2xl mx-auto text-center"
          style={{
            background: tokens.colors.errorBackground,
            color: tokens.colors.error,
            borderRadius: tokens.borders.cardRadius,
          }}
        >
          Error: {error}
        </div>
      )}

      {offers.length > 0 && (
        <div className="mt-10">
          <h3 
            className="mb-6 text-center md:text-left"
            style={{
              fontSize: tokens.typography.subheadingSize,
              fontWeight: tokens.typography.subheadingWeight,
              color: tokens.colors.textPrimary,
            }}
          >
            {isTableLayout ? `Results: ${offers.length} flight${offers.length !== 1 ? 's' : ''}` :
             `${offers.length} flight${offers.length !== 1 ? 's' : ''} found`}
          </h3>
          {isTableLayout ? (
            <FlightTable offers={offers} config={config} />
          ) : (
            <FlightCards offers={offers} config={config} />
          )}
        </div>
      )}
    </div>
  );
}

function getDefaultDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]!;
}

function getMinDate(): string {
  return new Date().toISOString().split('T')[0]!;
}

