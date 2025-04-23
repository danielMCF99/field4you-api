import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { jwtHelper, mailer, userRepository } from '../../app';
import { User, UserStatus } from '../../domain/entities/User';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { publishUserCreation } from '../../infrastructure/rabbitmq/rabbitmq.publisher';
import {
  RegisterUserDTO,
  registerUserSchema,
} from '../../domain/dtos/register-user.dto';
import { ZodError } from 'zod';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

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
  const user = await userRepository.findByEmail(email);

  if (user) {
    throw new BadRequestException('Given email is already being used.');
  }

  // Encrypt password
  const password = await bcrypt.hash(rawPassword, 10);
  const registerDate = new Date();
  const lastAccessDate = new Date();

  // Create new User in database
  const newUser = await userRepository.create(
    new User({
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
    newUser.getId(),
    newUser.userType.toString(),
    newUser.email
  );

  // Send greeting email
  mailer.sendMail(
    newUser.email,
    'Welcome to Field4You',
    'Welcome! Thank you for registering!'
  );

  // Publish event to RabbitMQ
  publishUserCreation({
    userId: newUser.getId(),
    email: newUser.email,
    firstName: firstName,
    lastName: lastName,
    location: {
      address: address,
      city: city,
      district: district,
    },
    userType: newUser.userType.toString(),
    birthDate: birthDate,
    registerDate: registerDate.toString(),
  });

  return token;
};
