import { z } from 'zod';

export const CreatePlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  isActive: z.boolean().optional().default(true),
});

export const UpdatePlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  isActive: z.boolean().optional(),
});

export type CreatePlanDto = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanDto = z.infer<typeof UpdatePlanSchema>;
