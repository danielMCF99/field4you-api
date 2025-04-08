import { Request } from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { jwtHelper, mailer, userRepository } from '../../app';
import config from '../../config/env';
import { User } from '../../domain/entities/User';
import { publishUserCreation } from '../../infrastructure/middlewares/rabbitmq.publisher';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const registerUser = async (req: Request): Promise<String> => {
  // Validate request sent for any necessary fields missing
  let { userType, email, password, firstName, lastName, birthDate } = req.body;

  if (
    !userType ||
    !password ||
    !email ||
    !firstName ||
    !lastName ||
    !birthDate
  ) {
    throw new BadRequestException(
      'Missing fields for user registration. Please try again.'
    );
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

  try {
    // Create new User in database
    const newUser = await userRepository.create(
      new User({
        userType,
        email,
        password,
        firstName,
        lastName,
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
      userType: newUser.userType.toString(),
      birthDate: birthDate,
      registerDate: registerDate.toString(),
    });

    return token;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
