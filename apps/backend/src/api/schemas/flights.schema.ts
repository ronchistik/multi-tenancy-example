import { z } from 'zod';

export const flightSearchSchema = z.object({
  origin: z.string().length(3, 'Origin must be a 3-letter airport code'),
  destination: z.string().length(3, 'Destination must be a 3-letter airport code'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  passengers: z.number().int().min(1).max(9).default(1),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),
});

export type FlightSearchSchema = z.infer<typeof flightSearchSchema>;

