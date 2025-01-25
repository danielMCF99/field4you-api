import { Request } from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { jwtHelper, mailer, userRepository } from '../../app';
import config from '../../config/env';
import { User } from '../../domain/entities/User';
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

  let token = 'N/A';
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

    // Send greeting email
    await mailer.sendMail(newUser.email, 'Welcome! Thank you for registering!');

    // Send request to create equivalent user in user-microservice
    await axios.post(config.userGatewayServiceUri + '/create', {
      authServiceUserId: newUser.getId(),
      userType: userType,
      email: email,
      firstName: firstName,
      lastName: lastName,
      birthDate: birthDate,
      registerDate: registerDate,
    });

    // Generate JWT Token
    token = await jwtHelper.generateToken(
      newUser.getId(),
      newUser.userType.toString(),
      newUser.email
    );
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }

  return token;
};
