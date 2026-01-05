/**
 * Duffel API Client
 * Low-level HTTP client for Duffel API
 */

import { httpRequest } from '../../shared/http.js';
import { ProviderError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';

const DUFFEL_API_BASE = 'https://api.duffel.com';

export class DuffelClient {
  constructor(private readonly apiKey: string) {}

  async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
  ): Promise<TResponse> {
    try {
      const url = `${DUFFEL_API_BASE}${endpoint}`;
      
      logger.debug('Duffel API request', { endpoint, body });

      // Duffel requires request body to be wrapped in 'data' key
      const wrappedBody = { data: body };

      const response = await httpRequest<TResponse>(url, {
        method: 'POST',
        headers: {
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: wrappedBody,
      });

      logger.debug('Duffel API response', { endpoint });
      
      return response;
    } catch (error) {
      logger.error('Duffel API error', { endpoint, error });
      
      if (error instanceof Error) {
        throw new ProviderError(
          `Duffel API error: ${error.message}`,
          'duffel',
        );
      }
      
      throw new ProviderError('Unknown Duffel API error', 'duffel');
    }
  }

  async get<TResponse>(endpoint: string): Promise<TResponse> {
    try {
      const url = `${DUFFEL_API_BASE}${endpoint}`;

      const response = await httpRequest<TResponse>(url, {
        method: 'GET',
        headers: {
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response;
    } catch (error) {
      logger.error('Duffel API error', { endpoint, error });
      
      if (error instanceof Error) {
        throw new ProviderError(
          `Duffel API error: ${error.message}`,
          'duffel',
        );
      }
      
      throw new ProviderError('Unknown Duffel API error', 'duffel');
    }
  }
}

