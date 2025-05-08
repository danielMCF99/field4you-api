import { z } from 'zod';

export const GetAllPostsDtoSchema = z.object({
  creatorEmail: z.string().email().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type GetAllPostsDto = z.infer<typeof GetAllPostsDtoSchema>;
