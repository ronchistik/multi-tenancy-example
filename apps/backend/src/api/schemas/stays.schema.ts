import { z } from 'zod';

export const staySearchSchema = z.object({
  locationId: z.string().min(1, 'Location ID is required'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  guests: z.number().int().min(1).max(10).default(2),
  rooms: z.number().int().min(1).max(5).default(1),
});

export type StaySearchSchema = z.infer<typeof staySearchSchema>;

