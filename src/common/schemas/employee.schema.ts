import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  roleId: z.string().uuid('Invalid role ID'),
  departmentId: z.string().uuid('Invalid department ID'),
  managerId: z.string().uuid('Invalid manager ID').nullable().optional(),
});

export const UpdateEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  managerId: z.string().uuid('Invalid manager ID').nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof UpdateEmployeeSchema>;
