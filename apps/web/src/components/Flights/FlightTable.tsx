/**
 * Flight table layout (for corporate/dense UX)
 */

import React from 'react';
import type { FlightOffer, TenantConfig } from '../../api';

interface FlightTableProps {
  offers: FlightOffer[];
  config: TenantConfig;
}

export function FlightTable({ offers, config }: FlightTableProps) {
  if (offers.length === 0) {
    return <p style={styles.empty}>No flights found</p>;
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Airline</th>
            <th style={styles.th}>Route</th>
            <th style={styles.th}>Departure</th>
            <th style={styles.th}>Arrival</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const slice = offer.slices[0];
            const hasWarnings = (offer.policy?.violations.length || 0) > 0;
            const isPreferred = offer.policy?.preferred;
            const hasPromo = (offer.policy?.promotions?.length || 0) > 0;

            return (
              <tr
                key={offer.id}
                style={{
                  ...styles.tr,
                  background: isPreferred && config.uxHints.highlightPreferred
                    ? '#f0fdf4'
                    : 'white',
                }}
              >
                <td style={styles.td}>
                  {offer.owner.name}
                  {isPreferred && config.uxHints.highlightPreferred && (
                    <span style={styles.preferredTag}>✓</span>
                  )}
                  {hasPromo && (
                    <span style={styles.promoTag}>✨</span>
                  )}
                </td>
                <td style={styles.td}>
                  {slice?.origin.code} → {slice?.destination.code}
                </td>
                <td style={styles.td}>
                  {slice && new Date(slice.departureTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td style={styles.td}>
                  {slice && new Date(slice.arrivalTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td style={{ ...styles.td, fontWeight: 600 }}>
                  {parseFloat(offer.price.amount).toFixed(0)} {offer.price.currency}
                </td>
                <td style={styles.td}>
                  {hasPromo && offer.policy?.promotions ? (
                    <div>
                      <span style={styles.promoBadge}>
                        ✨ {offer.policy.promotions[0]?.message}
                      </span>
                    </div>
                  ) : hasWarnings && config.uxHints.showPolicyCompliance ? (
                    <span style={styles.warningBadge}>
                      {offer.policy?.violations[0]?.severity === 'error' ? '🚫' : 
                       offer.policy?.violations[0]?.severity === 'info' ? 'ℹ️' : '⚠️'} {offer.policy?.violations[0]?.message}
                    </span>
                  ) : (
                    <span style={styles.okBadge}>Approved</span>
                  )}
                </td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.button, background: config.uxHints.primaryColor }}
                  >
                    Book
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    background: '#f9fafb',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    borderBottom: '2px solid #e5e7eb',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '12px 16px',
  },
  preferredTag: {
    marginLeft: '6px',
    color: '#10b981',
    fontWeight: 600,
  },
  promoTag: {
    marginLeft: '6px',
    fontSize: '14px',
  },
  promoBadge: {
    fontSize: '12px',
    color: '#7c3aed',
    fontWeight: 600,
  },
  warningBadge: {
    fontSize: '12px',
    color: '#d97706',
  },
  okBadge: {
    fontSize: '12px',
    color: '#059669',
    fontWeight: 500,
  },
  button: {
    padding: '6px 16px',
    fontSize: '13px',
    color: 'white',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#999',
  },
};

