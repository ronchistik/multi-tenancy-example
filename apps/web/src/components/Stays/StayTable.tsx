/**
 * Stay table layout (corporate)
 */

import React from 'react';
import type { StayOffer, TenantConfig } from '../../api';

interface StayTableProps {
  stays: StayOffer[];
  config: TenantConfig;
  checkInDate: string;
  checkOutDate: string;
}

export function StayTable({ stays, config, checkInDate, checkOutDate }: StayTableProps) {
  if (stays.length === 0) {
    return <p className="text-center py-10 text-gray-500">No hotels found</p>;
  }

  return (
    <div className="bg-white rounded-lg overflow-auto shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Hotel</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Rating</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Location</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Dates</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Room Type</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Price/Night</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Status</th>
            <th className="bg-gray-50 px-4 py-3 text-left font-semibold border-b-2 border-gray-200">Action</th>
          </tr>
        </thead>
        <tbody>
          {stays.map((stay) => {
            const rate = stay.rates[0];
            const hasWarnings = (stay.policy?.violations.length || 0) > 0;

            return (
              <tr key={stay.id} className="border-b border-gray-100">
                <td className="px-4 py-3">{stay.accommodation.name}</td>
                <td className="px-4 py-3">
                  {stay.accommodation.rating
                    ? `${'⭐'.repeat(Math.floor(stay.accommodation.rating))} ${stay.accommodation.rating.toFixed(1)}`
                    : 'N/A'}
                </td>
                <td className="px-4 py-3">{stay.accommodation.location?.city || 'N/A'}</td>
                <td className="px-4 py-3 text-xs">
                  {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3">{rate?.roomName || 'Standard'}</td>
                <td className="px-4 py-3 font-semibold">
                  {rate ? `${parseFloat(rate.price.amount).toFixed(0)} ${rate.price.currency}` : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  {hasWarnings && config.uxHints.showPolicyCompliance ? (
                    <span className="text-xs text-amber-600">
                      ⚠️ {stay.policy?.violations[0]?.message}
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
