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
    <div style={{ width: '100%', maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}>
      <h2 
        className="mb-6 text-center md:text-left"
        style={{
        fontSize: tokens.typography.headingSize,
        fontWeight: tokens.typography.headingWeight,
        color: tokens.colors.textPrimary,
        }}
      >
        {config.uxHints.priceEmphasis === 'low' ? 'Search Luxury Accommodations' : 'Search Hotels'}
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
          className="grid mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
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
              Location
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
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
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label 
              style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
              }}
            >
              Check-in
            </label>
            <input
              type="date"
              value={formData.checkInDate}
              min={getMinDate()}
              max={formData.checkOutDate || undefined}
              onChange={(e) => {
                const newCheckIn = e.target.value;
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

          <div className="flex flex-col gap-1">
            <label 
              style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
              }}
            >
              Check-out
            </label>
            <input
              type="date"
              value={formData.checkOutDate}
              min={formData.checkInDate || getMinDate()}
              onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
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

          <div className="flex flex-col gap-1">
            <label 
              style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
              }}
            >
              Guests
            </label>
            <input
              type="number"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              min={1}
              max={10}
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

          <div className="flex flex-col gap-1">
            <label 
              style={{
              fontSize: tokens.typography.labelSize,
              fontWeight: tokens.typography.labelWeight,
              color: tokens.colors.textSecondary,
              }}
            >
              Rooms
            </label>
            <input
              type="number"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
              min={1}
              max={5}
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
          {loading ? 'Searching...' : config.uxHints.buttonLabels?.searchStays || 'Search Hotels'}
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

      {stays.length > 0 && (
        <div className="mt-10">
          <h3 
            className="mb-6 text-center md:text-left"
            style={{
              fontSize: tokens.typography.subheadingSize,
              fontWeight: tokens.typography.subheadingWeight,
              color: tokens.colors.textPrimary,
            }}
          >
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

