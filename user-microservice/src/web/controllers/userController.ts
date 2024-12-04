import { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import config from '../../config/env';
import { User } from '../../domain/entities/User';
import { jwtHelper, userRepository } from '../../app';
import { createUser } from '../../application/use-cases/createUser';
import { getAll } from '../../application/use-cases/getAll';
import { getById } from '../../application/use-cases/getById';
import { updateUser } from '../../application/use-cases/updateUser';
import { deleteUser } from '../../application/use-cases/deleteUser';

export const createUserController = async (req: Request, res: Response) => {
  const {
    authServiceUserId,
    userType,
    email,
    firstName,
    lastName,
    birthDate,
    registerDate,
    lastAccessDate,
  } = req.body;

  if (
    !authServiceUserId ||
    !userType ||
    !email ||
    !firstName ||
    !lastName ||
    !birthDate ||
    !registerDate ||
    !lastAccessDate
  ) {
    res
      .status(400)
      .json({ message: 'Bad Request for User creation in user-service' });
    return;
  }
  try {
    const userRequest = new User({
      authServiceUserId,
      userType,
      email,
      firstName,
      lastName,
      birthDate,
      registerDate,
      lastAccessDate,
    });
    const newUser = await createUser(userRequest, userRepository);

    if (!newUser) {
      res.status(500).json({
        message: 'Something went wrong for new user registration',
      });
      return;
    }

    res.status(200).json({
      message: 'Successfully registered the user.',
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Something went wrong',
    });
    return;
  }
};

export const getAllController = async (req: Request, res: Response) => {
  try {
    const allUsers = await getAll(userRepository);
    res.status(200).json({ users: allUsers });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Something went wrong',
    });
    return;
  }
};

export const getByIdController = async (req: Request, res: Response) => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  try {
    const { found, user } = await getById(id, userRepository);

    if (!found) {
      console.log('User not found');
      res.status(404).json({ message: 'User for given ID not found' });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Something went wrong',
    });
    return;
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  const token = await jwtHelper.extractBearerToken(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'Bearer token required' });
    return;
  }

  // Validate that fields sent in the request body are allowed to be updated
  const allowedFields = [
    'phoneNumber',
    'district',
    'city',
    'address',
    'latitude',
    'longitude',
  ];

  const filteredBody: Record<string, any> = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  try {
    const { status, message, user } = await updateUser(
      id,
      token,
      filteredBody,
      userRepository
    );

    if (!user) {
      res.status(status).json({ message: message });
      return;
    }

    res.status(status).json(user);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Something went wrong',
    });
    return;
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  const token = await jwtHelper.extractBearerToken(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'Bearer token required' });
    return;
  }

  try {
    const { status, message, authServiceUserId } = await deleteUser(
      id,
      token,
      userRepository
    );

    if (authServiceUserId) {
      // Send request to create equivalent user in user-microservice
      await axios
        .delete(config.authGatewayServiceUri + `/${authServiceUserId}`, {
          headers: {
            authorization: req.headers.authorization,
          },
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            message:
              'Something went wrong for new user registration in user-service',
          });
          return;
        });
    }

    res.status(status).json({ message: message });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Something went wrong',
    });
    return;
  }
};
