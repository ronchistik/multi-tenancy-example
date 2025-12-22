/**
 * Stay table layout (corporate)
 */

import React from 'react';
import type { StayOffer, TenantConfig } from '../../api';

interface StayTableProps {
  stays: StayOffer[];
  config: TenantConfig;
}

export function StayTable({ stays, config }: StayTableProps) {
  if (stays.length === 0) {
    return <p style={styles.empty}>No hotels found</p>;
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Hotel</th>
            <th style={styles.th}>Rating</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Room Type</th>
            <th style={styles.th}>Price/Night</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {stays.map((stay) => {
            const rate = stay.rates[0];
            const hasWarnings = (stay.policy?.violations.length || 0) > 0;

            return (
              <tr key={stay.id} style={styles.tr}>
                <td style={styles.td}>{stay.accommodation.name}</td>
                <td style={styles.td}>
                  {stay.accommodation.rating
                    ? `${'⭐'.repeat(Math.floor(stay.accommodation.rating))} ${stay.accommodation.rating.toFixed(1)}`
                    : 'N/A'}
                </td>
                <td style={styles.td}>{stay.accommodation.location?.city || 'N/A'}</td>
                <td style={styles.td}>{rate?.roomName || 'Standard'}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>
                  {rate ? `${parseFloat(rate.price.amount).toFixed(0)} ${rate.price.currency}` : 'N/A'}
                </td>
                <td style={styles.td}>
                  {hasWarnings && config.uxHints.showPolicyCompliance ? (
                    <span style={styles.warningBadge}>
                      ⚠️ {stay.policy?.violations[0]?.message}
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

