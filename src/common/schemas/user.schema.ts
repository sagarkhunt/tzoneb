import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
