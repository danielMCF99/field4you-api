import { z } from 'zod';
import { UserType } from '../entities/Auth';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid birthDate format',
  }),
  district: z.string(),
  city: z.string(),
  address: z.string(),
});

export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
