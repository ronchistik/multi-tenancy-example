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

  return (
    <div>
      <h2 style={styles.title}>Search Flights</h2>

      <form onSubmit={handleSearch} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.field}>
            <label style={styles.label}>From</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
              placeholder="JFK"
              maxLength={3}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>To</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
              placeholder="LAX"
              maxLength={3}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Departure</label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Return</label>
            <input
              type="date"
              value={formData.returnDate || ''}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Passengers</label>
            <input
              type="number"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
              min={1}
              max={9}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Cabin Class</label>
            <select
              value={formData.cabinClass || config.flightDefaults.cabinClass}
              onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value as any })}
              style={styles.input}
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
          style={{ ...styles.button, background: config.uxHints.primaryColor }}
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>

      {error && <div style={styles.error}>Error: {error}</div>}

      {offers.length > 0 && (
        <div style={styles.results}>
          <h3 style={styles.resultsTitle}>
            {offers.length} flight{offers.length !== 1 ? 's' : ''} found
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

