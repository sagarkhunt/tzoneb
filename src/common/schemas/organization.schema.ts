import { z } from 'zod';

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  adminEmail: z.string().email('Invalid admin email address'),
  planId: z.string().uuid('Invalid plan ID'),
  licenseCount: z.number().int().min(1, 'License count must be at least 1').default(1),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
  adminEmail: z.string().email('Invalid admin email address').optional(),
  planId: z.string().uuid('Invalid plan ID').optional(),
  licenseCount: z.number().int().min(1, 'License count must be at least 1').optional(),
  isActive: z.boolean().optional(),
});

export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;
