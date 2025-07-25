import { Request, Response } from 'express';
import { getActiveUsers } from '../../application/use-cases/getActiveUsers';
import { loginUser } from '../../application/use-cases/loginUser';
import { passwordRecovery } from '../../application/use-cases/passwordRecovery';
import { passwordReset } from '../../application/use-cases/passwordReset';
import { registerUser } from '../../application/use-cases/registerUser';
import { registerUsersFromCSV } from '../../application/use-cases/registerUsersFromCSV';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const token = await registerUser(req);
    res.status(200).json({
      message: 'Successfully registered the user.',
      token: token,
    });
    return;
  } catch (error: any) {
    if (error.details) {
      res
        .status(error.statusCode)
        .json({ message: error.message, details: error.details });
      return;
    }

    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const token = await loginUser(req);
    res.status(200).json({
      message: 'Login was successfull.',
      token: token,
    });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const passwordRecoveryController = async (
  req: Request,
  res: Response
) => {
  try {
    const message = await passwordRecovery(req);

    res.status(200).json({ message: message });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }
};

export const passwordResetController = async (req: Request, res: Response) => {
  try {
    const message = await passwordReset(req);
    res.status(200).json({ message: message });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }
};

export const activeUsersController = async (req: Request, res: Response) => {
  try {
    const response = await getActiveUsers(req);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }
};

export const registerUsersFromCSVController = async (req: Request, res: Response) => {
  try {
    const result = await registerUsersFromCSV(req);
    res.status(200).json({
      message: 'Batch registration completed.',
      ...result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
