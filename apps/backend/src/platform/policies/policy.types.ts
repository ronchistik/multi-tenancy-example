/**
 * Policy evaluation results and types
 */

export interface PolicyViolation {
  type: string;
  message: string;
  severity: 'warning' | 'error' | 'info';
}

export interface PolicyPromotion {
  type: string;
  message: string;
  value?: string | number;
}

export interface PolicyEvaluation {
  compliant: boolean;
  violations: PolicyViolation[];
  preferred?: boolean;
  promotions?: PolicyPromotion[];
}

export interface PolicyEnrichedResult<T> {
  data: T;
  policy: PolicyEvaluation;
}

