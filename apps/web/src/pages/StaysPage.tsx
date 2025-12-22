/**
 * Stays search page
 */

import React, { useState } from 'react';
import type { TenantConfig, StaySearchRequest, StayOffer, Location } from '../api';
import { StayCards } from '../components/Stays/StayCards';
import { StayTable } from '../components/Stays/StayTable';

interface StaysPageProps {
  config: TenantConfig;
  locations: Location[];
  onSearch: (request: StaySearchRequest) => Promise<{ stays: StayOffer[] }>;
}

export function StaysPage({ config, locations, onSearch }: StaysPageProps) {
  const [loading, setLoading] = useState(false);
  const [stays, setStays] = useState<StayOffer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<StaySearchRequest>({
    locationId: locations[0]?.id || 'nyc',
    checkInDate: getDefaultDate(7),
    checkOutDate: getDefaultDate(10),
    guests: config.stayDefaults.guestsCount,
    rooms: config.stayDefaults.roomsCount,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await onSearch(formData);
      setStays(result.stays);
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
        fontSize: isPriceHigh ? '28px' : isTableLayout ? '20px' : '24px',
      }}>
        {isDark ? 'Search Luxury Accommodations' : 'Search Hotels'}
      </h2>

      <form onSubmit={handleSearch} style={{
        ...styles.form,
        background: isDark ? '#2a2a2a' : 'white',
        border: isDark ? '1px solid #3a3a3a' : 'none',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={styles.formRow}>
          <div style={styles.field}>
            <label style={styles.label}>Location</label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              required
              style={styles.input}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Check-in</label>
            <input
              type="date"
              value={formData.checkInDate}
              onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Check-out</label>
            <input
              type="date"
              value={formData.checkOutDate}
              onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Guests</label>
            <input
              type="number"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              min={1}
              max={10}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Rooms</label>
            <input
              type="number"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
              min={1}
              max={5}
              required
              style={styles.input}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.button, background: config.uxHints.primaryColor }}
        >
          {loading ? 'Searching...' : 'Search Hotels'}
        </button>
      </form>

      {error && <div style={styles.error}>Error: {error}</div>}

      {stays.length > 0 && (
        <div style={styles.results}>
          <h3 style={styles.resultsTitle}>
            {stays.length} hotel{stays.length !== 1 ? 's' : ''} found
          </h3>
          {isTableLayout ? (
            <StayTable stays={stays} config={config} />
          ) : (
            <StayCards stays={stays} config={config} />
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

