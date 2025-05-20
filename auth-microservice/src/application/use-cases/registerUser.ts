import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { ZodError } from 'zod';
import { authRepository, jwtHelper, mailer } from '../../app';
import {
  RegisterUserDTO,
  registerUserSchema,
} from '../../domain/dtos/register-user.dto';
import { Auth, UserStatus } from '../../domain/entities/Auth';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { publishUserCreation } from '../../infrastructure/rabbitmq/rabbitmq.publisher';

export const registerUser = async (req: Request): Promise<String> => {
  // Validate request sent for any necessary fields missing
  let parsed: RegisterUserDTO;
  try {
    parsed = registerUserSchema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      const missingFields = error.errors.map((err) => err.path.join('.'));
      throw new BadRequestException('Missing or invalid required fields', {
        missingFields,
      });
    }

    throw new InternalServerErrorException(
      'Unexpected error parsing request data'
    );
  }
  const {
    userType,
    email,
    password: rawPassword,
    firstName,
    lastName,
    birthDate,
    district,
    city,
    address,
  } = parsed;

  // Check if given email already exists
  const auth = await authRepository.findByEmail(email);

  if (auth) {
    throw new BadRequestException('Given email is already being used.');
  }
  // Encrypt password
  const password = await bcrypt.hash(rawPassword, 10);
  const registerDate = new Date();
  const lastAccessDate = new Date();

  // Create new User in database
  const newAuth = await authRepository.create(
    new Auth({
      userType,
      email,
      password,
      status: UserStatus.active,
      registerDate,
      lastAccessDate,
    })
  );
  // Generate JWT Token
  const token = await jwtHelper.generateToken(
    newAuth.getId(),
    newAuth.userType.toString(),
    newAuth.email
  );

  // Send greeting email
  mailer.sendMail(
    newAuth.email,
    'Welcome to Field4You',
    'Welcome! Thank you for registering!'
  );

  // Publish event to RabbitMQ
  publishUserCreation({
    userId: newAuth.getId(),
    email: newAuth.email,
    firstName: firstName,
    lastName: lastName,
    location: {
      address: address,
      city: city,
      district: district,
    },
    userType: newAuth.userType.toString(),
    birthDate: birthDate,
  });

  return token;
};
