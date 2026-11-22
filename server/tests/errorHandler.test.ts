import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, NotFoundError, RateLimitError, ExternalApiError } from '../errors/AppError.js';

describe('AppError Hierarchy Tests', () => {
  it('constructs base AppError with correct defaults', () => {
    const error = new AppError('Database connection timeout', 503);
    expect(error.message).toBe('Database connection timeout');
    expect(error.statusCode).toBe(503);
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('constructs ValidationError with 400 status', () => {
    const error = new ValidationError('Invalid email format', { field: 'email' });
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.details).toEqual({ field: 'email' });
  });

  it('constructs NotFoundError with 404 status', () => {
    const error = new NotFoundError('User profile not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('constructs RateLimitError with 429 status and retry seconds', () => {
    const error = new RateLimitError('Too many requests', 45);
    expect(error.statusCode).toBe(429);
    expect(error.retryAfterSeconds).toBe(45);
  });

  it('constructs ExternalApiError with 502 status', () => {
    const error = new ExternalApiError('Open-Meteo gateway failed');
    expect(error.statusCode).toBe(502);
  });
});
