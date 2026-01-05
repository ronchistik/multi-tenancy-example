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
    return <p className="text-center py-10 text-gray-500">No flights found</p>;
  }

  return (
    <div className="bg-white rounded-lg overflow-auto shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Airline</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Route</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Departure</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Arrival</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Price</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Status</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Action</th>
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
                className="border-b border-gray-100"
                style={{
                  background: isPreferred && config.uxHints.highlightPreferred ? '#f0fdf4' : 'white',
                }}
              >
                <td className="px-4 py-3">
                  {offer.owner.name}
                  {isPreferred && config.uxHints.highlightPreferred && (
                    <span className="ml-1 text-emerald-500 font-semibold">✓</span>
                  )}
                  {hasPromo && (
                    <span className="ml-1 text-sm">✨</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {slice?.origin.code} → {slice?.destination.code}
                </td>
                <td className="px-4 py-3">
                  {slice && new Date(slice.departureTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3">
                  {slice && new Date(slice.arrivalTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {parseFloat(offer.price.amount).toFixed(0)} {offer.price.currency}
                </td>
                <td className="px-4 py-3">
                  {hasPromo && offer.policy?.promotions ? (
                    <span className="text-xs text-purple-600 font-semibold">
                      ✨ {offer.policy.promotions[0]?.message}
                    </span>
                  ) : hasWarnings && config.uxHints.showPolicyCompliance ? (
                    <span className="text-xs text-amber-600">
                      {offer.policy?.violations[0]?.severity === 'error' ? '🚫' : 
                       offer.policy?.violations[0]?.severity === 'info' ? 'ℹ️' : '⚠️'} {offer.policy?.violations[0]?.message}
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Approved</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="px-4 py-1 text-sm text-white rounded"
                    style={{ background: config.uxHints.primaryColor }}
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
