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
    <div>
      <h2 style={{
        fontSize: tokens.typography.headingSize,
        fontWeight: tokens.typography.headingWeight,
        color: tokens.colors.textPrimary,
        marginBottom: '20px',
      }}>
        {config.uxHints.priceEmphasis === 'low' ? 'Search Premium Flights' : 'Search Flights'}
      </h2>

      <form onSubmit={handleSearch} style={{
        background: tokens.colors.cardBackground,
        padding: tokens.spacing.formPadding,
        borderRadius: tokens.borders.cardRadius,
        marginBottom: '30px',
        boxShadow: tokens.shadows.form,
        border: tokens.borders.cardBorderWidth !== '0' ? tokens.borders.cardBorderWidth + ' solid ' + tokens.colors.border : 'none',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTableLayout ? 'repeat(6, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: tokens.spacing.formGap,
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>From</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
              placeholder="JFK"
              maxLength={3}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>To</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
              placeholder="LAX"
              maxLength={3}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>Departure</label>
            <input
              type="date"
              value={formData.departureDate}
              min={getMinDate()}
              max={formData.returnDate || undefined}
              onChange={(e) => {
                const newDeparture = e.target.value;
                // If departure is after return, adjust return date
                if (formData.returnDate && newDeparture > formData.returnDate) {
                  setFormData({ ...formData, departureDate: newDeparture, returnDate: newDeparture });
                } else {
                  setFormData({ ...formData, departureDate: newDeparture });
                }
              }}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>Return</label>
            <input
              type="date"
              value={formData.returnDate || ''}
              min={formData.departureDate || getMinDate()}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>Passengers</label>
            <input
              type="number"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
              min={1}
              max={9}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>Cabin Class</label>
            <select
              value={formData.cabinClass || config.flightDefaults.cabinClass}
              onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value as any })}
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
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
          style={{ 
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s',
            background: config.uxHints.primaryColor,
            color: 'white',
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.buttonSize,
            fontWeight: tokens.typography.buttonWeight,
            padding: tokens.spacing.buttonPadding,
            borderRadius: tokens.borders.buttonRadius,
            textTransform: config.uxHints.priceEmphasis === 'low' ? 'uppercase' : 'none',
            letterSpacing: config.uxHints.priceEmphasis === 'low' ? '1px' : 'normal',
          }}
        >
          {loading ? 'Searching...' : config.uxHints.buttonLabels?.searchFlights || 'Search Flights'}
        </button>
      </form>

      {error && <div style={{
        background: tokens.colors.errorBackground,
        color: tokens.colors.error,
        padding: '12px',
        borderRadius: tokens.borders.cardRadius,
        marginBottom: '20px',
      }}>Error: {error}</div>}

      {offers.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{
            fontSize: tokens.typography.subheadingSize,
            fontWeight: tokens.typography.subheadingWeight,
            color: tokens.colors.textPrimary,
            marginBottom: '20px',
          }}>
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

const styles = {
  title: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '20px',
  },
  form: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#555',
  },
  input: {
    padding: '8px 12px',
    fontSize: '14px',
  },
  button: {
    padding: '12px 24px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 600,
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  results: {
    marginTop: '30px',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '20px',
  },
};

