import { z } from 'zod';

export const nearbyStopsQuerySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  radiusMeters: z.coerce.number().min(50).max(5000).default(500),
  limit: z.coerce.number().min(1).max(100).default(30),
});

export type NearbyStopsQuery = z.infer<typeof nearbyStopsQuerySchema>;

export const stopDeparturesQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .optional(),
  limit: z.coerce.number().min(1).max(200).default(30),
});

export type StopDeparturesQuery = z.infer<typeof stopDeparturesQuerySchema>;
