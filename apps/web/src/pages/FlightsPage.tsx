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
  const isDark = config.uxHints.theme === 'dark';
  const isPriceHigh = config.uxHints.priceEmphasis === 'high';

  return (
    <div>
      <h2 style={{
        ...styles.title,
        color: isDark ? '#e5e5e5' : '#333',
        fontSize: isPriceHigh ? '26px' : isTableLayout ? '20px' : '24px',
        fontWeight: isPriceHigh ? 700 : 600,
      }}>
        {isPriceHigh ? 'Search Flights' : 
         isDark ? 'Search Premium Flights' : 
         'Flight Search'}
      </h2>

      <form onSubmit={handleSearch} style={{
        ...styles.form,
        background: isDark ? '#2a2a2a' : 'white',
        border: isDark ? '1px solid #3a3a3a' : isPriceHigh ? '3px solid ' + config.uxHints.primaryColor : 'none',
        boxShadow: isPriceHigh ? '0 4px 12px rgba(16, 185, 129, 0.15)' : isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          ...styles.formRow,
          gridTemplateColumns: isTableLayout ? 'repeat(6, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: isPriceHigh ? '20px' : '16px',
        }}>
          <div style={styles.field}>
            <label style={{
              ...styles.label,
              color: isDark ? '#a0a0a0' : '#555',
              fontSize: isPriceHigh ? '15px' : '14px',
              fontWeight: isPriceHigh ? 600 : 500,
            }}>From</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
              placeholder="JFK"
              maxLength={3}
              required
              style={{
                ...styles.input,
                background: isDark ? '#1a1a1a' : 'white',
                color: isDark ? '#e5e5e5' : '#333',
                border: isDark ? '1px solid #4a4a4a' : isPriceHigh ? '2px solid #e5e7eb' : '1px solid #ddd',
                fontSize: isPriceHigh ? '16px' : '14px',
                padding: isPriceHigh ? '12px' : '8px 12px',
              }}
            />
          </div>

          <div style={styles.field}>
            <label style={{
              ...styles.label,
              color: isDark ? '#a0a0a0' : '#555',
              fontSize: isPriceHigh ? '15px' : '14px',
              fontWeight: isPriceHigh ? 600 : 500,
            }}>To</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
              placeholder="LAX"
              maxLength={3}
              required
              style={{
                ...styles.input,
                background: isDark ? '#1a1a1a' : 'white',
                color: isDark ? '#e5e5e5' : '#333',
                border: isDark ? '1px solid #4a4a4a' : isPriceHigh ? '2px solid #e5e7eb' : '1px solid #ddd',
                fontSize: isPriceHigh ? '16px' : '14px',
                padding: isPriceHigh ? '12px' : '8px 12px',
              }}
            />
          </div>

          <div style={styles.field}>
            <label style={{
              ...styles.label,
              color: isDark ? '#a0a0a0' : '#555',
              fontSize: isPriceHigh ? '15px' : '14px',
              fontWeight: isPriceHigh ? 600 : 500,
            }}>Departure</label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              required
              style={{
                ...styles.input,
                background: isDark ? '#1a1a1a' : 'white',
                color: isDark ? '#e5e5e5' : '#333',
                border: isDark ? '1px solid #4a4a4a' : isPriceHigh ? '2px solid #e5e7eb' : '1px solid #ddd',
                fontSize: isPriceHigh ? '16px' : '14px',
                padding: isPriceHigh ? '12px' : '8px 12px',
              }}
            />
          </div>

          <div style={styles.field}>
            <label style={{
              ...styles.label,
              color: isDark ? '#a0a0a0' : '#555',
              fontSize: isPriceHigh ? '15px' : '14px',
              fontWeight: isPriceHigh ? 600 : 500,
            }}>Return</label>
            <input
              type="date"
              value={formData.returnDate || ''}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              style={{
                ...styles.input,
                background: isDark ? '#1a1a1a' : 'white',
                color: isDark ? '#e5e5e5' : '#333',
                border: isDark ? '1px solid #4a4a4a' : isPriceHigh ? '2px solid #e5e7eb' : '1px solid #ddd',
                fontSize: isPriceHigh ? '16px' : '14px',
                padding: isPriceHigh ? '12px' : '8px 12px',
              }}
            />
          </div>

          <div style={styles.field}>
            <label style={{
              ...styles.label,
              color: isDark ? '#a0a0a0' : '#555',
              fontSize: isPriceHigh ? '15px' : '14px',
              fontWeight: isPriceHigh ? 600 : 500,
            }}>Passengers</label>
            <input
              type="number"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
              min={1}
              max={9}
              required
              style={{
                ...styles.input,
                background: isDark ? '#1a1a1a' : 'white',
                color: isDark ? '#e5e5e5' : '#333',
                border: isDark ? '1px solid #4a4a4a' : isPriceHigh ? '2px solid #e5e7eb' : '1px solid #ddd',
                fontSize: isPriceHigh ? '16px' : '14px',
                padding: isPriceHigh ? '12px' : '8px 12px',
              }}
            />
          </div>

          <div style={styles.field}>
            <label style={{
              ...styles.label,
              color: isDark ? '#a0a0a0' : '#555',
              fontSize: isPriceHigh ? '15px' : '14px',
              fontWeight: isPriceHigh ? 600 : 500,
            }}>Cabin Class</label>
            <select
              value={formData.cabinClass || config.flightDefaults.cabinClass}
              onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value as any })}
              style={{
                ...styles.input,
                background: isDark ? '#1a1a1a' : 'white',
                color: isDark ? '#e5e5e5' : '#333',
                border: isDark ? '1px solid #4a4a4a' : isPriceHigh ? '2px solid #e5e7eb' : '1px solid #ddd',
                fontSize: isPriceHigh ? '16px' : '14px',
                padding: isPriceHigh ? '12px' : '8px 12px',
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
            ...styles.button, 
            background: config.uxHints.primaryColor,
            fontSize: isPriceHigh ? '18px' : '16px',
            padding: isPriceHigh ? '16px 32px' : isTableLayout ? '10px 20px' : '12px 24px',
            fontWeight: isPriceHigh ? 700 : 600,
            textTransform: isDark ? 'uppercase' : 'none',
            letterSpacing: isDark ? '1px' : 'normal',
          }}
        >
          {loading ? 'Searching...' : config.uxHints.buttonLabels?.searchFlights || 'Search Flights'}
        </button>
      </form>

      {error && <div style={{
        ...styles.error,
        background: isDark ? '#3a1a1a' : '#fee',
        color: isDark ? '#ff6b6b' : '#c00',
        border: isDark ? '1px solid #4a2a2a' : 'none',
      }}>Error: {error}</div>}

      {offers.length > 0 && (
        <div style={styles.results}>
          <h3 style={{
            ...styles.resultsTitle,
            color: isDark ? '#e5e5e5' : '#333',
            fontSize: isPriceHigh ? '22px' : '18px',
          }}>
            {isPriceHigh ? `${offers.length} Budget Flight${offers.length !== 1 ? 's' : ''} Found` :
             isTableLayout ? `Results: ${offers.length} flight${offers.length !== 1 ? 's' : ''}` :
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

