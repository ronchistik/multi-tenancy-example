/**
 * Flight policy evaluation
 * Applies tenant-specific rules to flight offers
 */

import type { Tenant } from '../tenant/tenant.types.js';
import type { PolicyEvaluation, PolicyViolation } from './policy.types.js';

export interface FlightOffer {
  id: string;
  owner: {
    iata_code?: string;
    name: string;
  };
  total_amount: string;
  total_currency: string;
  slices: Array<{
    segments: Array<{
      operating_carrier?: {
        iata_code?: string;
      };
      marketing_carrier?: {
        iata_code?: string;
      };
    }>;
  }>;
}

/**
 * Evaluate flight offer against tenant policies
 */
export function evaluateFlightPolicy(offer: FlightOffer, tenant: Tenant): PolicyEvaluation {
  const violations: PolicyViolation[] = [];
  const promotions: PolicyPromotion[] = [];
  let preferred = false;

  const ownerCode = offer.owner.iata_code || '';

  // Check preferred airlines
  const preferredAirlines = tenant.flightDefaults.preferredAirlines;
  if (preferredAirlines && preferredAirlines.length > 0) {
    if (preferredAirlines.includes(ownerCode)) {
      preferred = true;
    } else {
      const policyRule = tenant.policies.find((p) => p.type === 'preferred_airline');
      if (policyRule && tenant.uxHints.showPolicyCompliance) {
        violations.push({
          type: 'preferred_airline',
          message: policyRule.message || 'Not a preferred airline',
          severity: 'warning',
        });
      }
    }
  }

  // Check excluded airlines (general)
  const excludedAirlines = tenant.flightDefaults.excludedAirlines;
  if (excludedAirlines && excludedAirlines.length > 0) {
    if (excludedAirlines.includes(ownerCode)) {
      violations.push({
        type: 'excluded_airline',
        message: `${offer.owner.name} is not approved for booking`,
        severity: 'error',
      });
    }
  }

  // Check budget airline exclusions (hard block)
  const budgetExclusionPolicy = tenant.policies.find((p) => p.type === 'budget_airline_excluded');
  if (budgetExclusionPolicy) {
    const budgetAirlines = (budgetExclusionPolicy.value as string).split(',');
    if (budgetAirlines.includes(ownerCode)) {
      violations.push({
        type: 'budget_airline_excluded',
        message: budgetExclusionPolicy.message || 'Budget airlines not permitted',
        severity: 'error',
      });
    }
  }

  // Check cashback promotions
  const cashbackPolicy = tenant.policies.find((p) => p.type === 'cashback_promotion');
  if (cashbackPolicy && tenant.uxHints.showPromotions) {
    const applicableAirlines = cashbackPolicy.metadata?.applicableAirlines || [];
    if (applicableAirlines.includes(ownerCode)) {
      const percent = cashbackPolicy.metadata?.cashbackPercent || 0;
      promotions.push({
        type: 'cashback',
        message: cashbackPolicy.message || `Earn ${percent}% cash back`,
        value: percent,
      });
    }
  }

  // Check role-based cabin restrictions
  const rolePolicy = tenant.policies.find((p) => p.type === 'role_based_cabin');
  if (rolePolicy && tenant.uxHints.showPolicyCompliance) {
    const userRole = tenant.defaultUserRole || 'employee';
    const requiredRole = rolePolicy.metadata?.requiredRole;
    
    if (requiredRole && userRole !== requiredRole) {
      violations.push({
        type: 'role_based_cabin',
        message: rolePolicy.message || `Business class requires ${requiredRole} role`,
        severity: 'info',
      });
    }
  }

  const compliant = violations.filter((v) => v.severity === 'error').length === 0;

  return {
    compliant,
    violations,
    preferred,
    promotions: promotions.length > 0 ? promotions : undefined,
  };
}

