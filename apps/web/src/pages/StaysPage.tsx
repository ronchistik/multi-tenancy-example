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
  const tokens = config.uxHints.designTokens;

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.headingSize,
        fontWeight: tokens.typography.headingWeight,
        color: tokens.colors.textPrimary,
        marginBottom: '20px',
      }}>
        {config.uxHints.priceEmphasis === 'low' ? 'Search Luxury Accommodations' : 'Search Hotels'}
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
          gridTemplateColumns: isTableLayout ? 'repeat(5, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: tokens.spacing.formGap,
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>Location</label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
            }}>Check-in</label>
            <input
              type="date"
              value={formData.checkInDate}
              min={getMinDate()}
              max={formData.checkOutDate || undefined}
              onChange={(e) => {
                const newCheckIn = e.target.value;
                // If check-in is after check-out, adjust check-out
                if (formData.checkOutDate && newCheckIn >= formData.checkOutDate) {
                  const nextDay = new Date(newCheckIn);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setFormData({ 
                    ...formData, 
                    checkInDate: newCheckIn, 
                    checkOutDate: nextDay.toISOString().split('T')[0]! 
                  });
                } else {
                  setFormData({ ...formData, checkInDate: newCheckIn });
                }
              }}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
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
            }}>Check-out</label>
            <input
              type="date"
              value={formData.checkOutDate}
              min={formData.checkInDate || getMinDate()}
              onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
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
            }}>Guests</label>
            <input
              type="number"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              min={1}
              max={10}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
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
            }}>Rooms</label>
            <input
              type="number"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
              min={1}
              max={5}
              required
              style={{
                padding: tokens.spacing.inputPadding,
                fontSize: tokens.typography.bodySize,
                fontWeight: tokens.typography.bodyWeight,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.inputBackground,
                color: tokens.colors.textPrimary,
                border: '1px solid ' + tokens.colors.inputBorder,
                borderRadius: tokens.borders.inputRadius,
              }}
            />
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
          {loading ? 'Searching...' : config.uxHints.buttonLabels?.searchStays || 'Search Hotels'}
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

