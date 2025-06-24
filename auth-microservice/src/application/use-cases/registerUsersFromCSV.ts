import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { ZodError } from 'zod';
import { authRepository, jwtHelper, mailer } from '../../app';
import {
  RegisterUserDTO,
  registerUserSchema,
} from '../../domain/dtos/register-user.dto';
import { Auth, UserStatus, UserType } from '../../domain/entities/Auth';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishUserCreation } from '../../infrastructure/rabbitmq/rabbitmq.publisher';
import { parseCSVUsers } from '../../utils/csvParser';

export const registerUsersFromCSV = async (
  req: Request
): Promise<{ created: number; skipped: number }> => {
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!req.file) {
    throw new BadRequestException('CSV file is missing.');
  }

  if (userType !== UserType.admin) {
    throw new UnauthorizedException('Unauthorized access.');
  }

  const users = await parseCSVUsers(req.file.buffer);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    console.log(user);
    let parsed: RegisterUserDTO;
    try {
      parsed = registerUserSchema.parse(user);

      const existing = await authRepository.findByEmail(parsed.email);
      if (existing) {
        console.warn(`Skipping user with existing email: ${parsed.email}`);
        skipped++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      const now = new Date();

      const newAuth = await authRepository.create(
        new Auth({
          userType: parsed.userType ? parsed.userType : UserType.user,
          email: parsed.email,
          password: hashedPassword,
          status: UserStatus.active,
          registerDate: now,
          lastAccessDate: now,
        })
      );

      await jwtHelper.generateToken(
        newAuth.getId(),
        newAuth.userType.toString(),
        newAuth.email
      );

      publishUserCreation({
        userId: newAuth.getId(),
        email: newAuth.email,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        location: {
          address: parsed.address,
          city: parsed.city,
          district: parsed.district,
        },
        userType: newAuth.userType.toString(),
        birthDate: parsed.birthDate,
        phoneNumber: parsed.phoneNumber,
      });

      created++;
    } catch (error) {
      if (error instanceof ZodError) {
        const missingFields = error.errors.map((err) => err.path.join('.'));
        console.warn(
          `Skipping user due to invalid fields: ${missingFields.join(', ')}`
        );
        skipped++;
        throw new BadRequestException('Error in CSV file content');
      }

      throw new Error('Unexpected error parsing user data.');
    }
    /*
    // It is not critical to fail email sending
    try {
      mailer.sendMail(
        user.email,
        'Welcome to Field4You',
        'Welcome! Thank you for registering!'
      );
    } catch (error) {
      console.log('Error sending email');
    }*/
  }

  return { created, skipped };
};
