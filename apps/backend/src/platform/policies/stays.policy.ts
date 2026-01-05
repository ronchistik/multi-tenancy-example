/**
 * Stay (hotel) policy evaluation
 * Applies tenant-specific rules to stay offers
 */

import type { Tenant } from '../tenant/tenant.types.js';
import type { PolicyEvaluation, PolicyViolation } from './policy.types.js';

export interface StayOffer {
  id: string;
  accommodation: {
    name: string;
    rating?: number;
  };
  rates: Array<{
    total_amount: string;
    total_currency: string;
  }>;
}

/**
 * Evaluate stay offer against tenant policies
 */
export function evaluateStayPolicy(offer: StayOffer, tenant: Tenant): PolicyEvaluation {
  const violations: PolicyViolation[] = [];

  // Check minimum star rating
  const minStarRating = tenant.stayDefaults.minStarRating;
  if (minStarRating && offer.accommodation.rating) {
    if (offer.accommodation.rating < minStarRating) {
      const policyRule = tenant.policies.find((p) => p.type === 'star_rating_min');
      violations.push({
        type: 'star_rating_min',
        message: policyRule?.message || `Below ${minStarRating}-star minimum`,
        severity: 'warning',
      });
    }
  }

  // Check max nightly price
  const maxNightlyPrice = tenant.stayDefaults.maxNightlyPrice;
  if (maxNightlyPrice && offer.rates[0]) {
    const totalAmount = parseFloat(offer.rates[0].total_amount);
    
    if (totalAmount > maxNightlyPrice) {
      const policyRule = tenant.policies.find((p) => p.type === 'price_cap');
      if (policyRule && tenant.uxHints.showPolicyCompliance) {
        violations.push({
          type: 'price_cap',
          message: policyRule.message || `Exceeds maximum price of ${maxNightlyPrice}`,
          severity: 'warning',
        });
      }
    }
  }

  const compliant = violations.filter((v) => v.severity === 'error').length === 0;

  return {
    compliant,
    violations,
  };
}

