import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { jwtHelper, mailer, userRepository } from '../../app';
import { User } from '../../domain/entities/User';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { publishUserCreation } from '../../infrastructure/middlewares/rabbitmq.publisher';

export const registerUser = async (req: Request): Promise<String> => {
  // Validate request sent for any necessary fields missing
  let {
    userType,
    email,
    password,
    firstName,
    lastName,
    birthDate,
    district,
    city,
    address,
  } = req.body;

  const requiredFields = {
    userType,
    password,
    email,
    firstName,
    lastName,
    birthDate,
    district,
    city,
    address,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new BadRequestException('Missing required fields', { missingFields });
  }

  // Check if given email already exists
  const user = await userRepository.findByEmail(email);

  if (user) {
    throw new BadRequestException('Given email is already being used.');
  }

  // Encrypt password
  password = await bcrypt.hash(password, 10);
  const registerDate = new Date();
  const lastAccessDate = new Date();

  // Create new User in database
  const newUser = await userRepository.create(
    new User({
      userType,
      email,
      password,
      firstName,
      lastName,
      location: {
        district,
        city,
        address,
      },
      birthDate,
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
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    location: newUser.getLocation(),
    userType: newUser.userType.toString(),
    birthDate: birthDate,
    registerDate: registerDate.toString(),
  });

  return token;
};
