import { Request, Response } from 'express';
import { registerUser } from '../../application/use-cases/registerUser';
import { loginUser } from '../../application/use-cases/loginUser';
import { passwordReset } from '../../application/use-cases/passwordReset';
import { passwordRecovery } from '../../application/use-cases/passwordRecovery';
import { deleteUser } from '../../application/use-cases/deleteUser';
import { verifyToken } from '../../application/use-cases/verifyToken';

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const token = await registerUser(req);
    res.status(200).json({
      message: 'Successfully registered the user.',
      token: token,
    });
    return;
  } catch (error: any) {
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

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const isDeleted = await deleteUser(req);
    res.status(200).json({ isDeleted: isDeleted });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }
};

export const verifyTokenController = async (req: Request, res: Response) => {
  try {
    const isValid = await verifyToken(req);
    res.status(200).json({ isValid: isValid });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }
};
