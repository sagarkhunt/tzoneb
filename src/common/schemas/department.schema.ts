import { z } from 'zod';

export const CreateDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateDepartmentDto = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof UpdateDepartmentSchema>;
