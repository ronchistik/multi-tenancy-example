export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TenantNotFoundError extends AppError {
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`, 404, 'TENANT_NOT_FOUND');
  }
}

export class VerticalDisabledError extends AppError {
  constructor(vertical: string, tenantId: string) {
    super(`Vertical '${vertical}' is disabled for tenant '${tenantId}'`, 403, 'VERTICAL_DISABLED');
  }
}

export class ProviderError extends AppError {
  constructor(message: string, public readonly provider: string) {
    super(message, 502, 'PROVIDER_ERROR');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

