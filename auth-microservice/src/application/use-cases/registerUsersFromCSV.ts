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
import { parseCSVUsers, CSVUser } from '../../utils/csvParser';
import { publishUserCreation } from '../../infrastructure/rabbitmq/rabbitmq.publisher';

export const registerUsersFromCSV = async (
  req: Request
): Promise<{ created: number; skipped: number }> => {
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!req.file) {
    throw new BadRequestException('CSV file is missing.');
  }

  if (userType !== 'Admin') {
    throw new UnauthorizedException('Unauthorized access.');
  }

  const users = await parseCSVUsers(req.file.buffer);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    let parsed: RegisterUserDTO;
    try {
      parsed = registerUserSchema.parse(user);
    } catch (error) {
      if (error instanceof ZodError) {
        const missingFields = error.errors.map((err) => err.path.join('.'));
        console.warn(`Skipping user due to invalid fields: ${missingFields.join(', ')}`);
        skipped++;
        continue;
      }

      throw new Error('Unexpected error parsing user data.');
    }

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
        userType: UserType.user,
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

    mailer.sendMail(
      newAuth.email,
      'Welcome to Field4You',
      'Welcome! Thank you for registering!'
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
  }

  return { created, skipped };
};