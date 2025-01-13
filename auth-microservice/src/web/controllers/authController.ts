import { Request, Response } from 'express';
import { registerUser } from '../../application/use-cases/registerUser';
import { loginUser } from '../../application/use-cases/loginUser';
import { passwordReset } from '../../application/use-cases/passwordReset';
import { passwordRecovery } from '../../application/use-cases/passwordRecovery';
import { userRepository, mailer } from '../../app';
import { deleteUser } from '../../application/use-cases/deleteUser';
import { verifyToken } from '../../application/use-cases/verifyToken';

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const token = await registerUser(req, userRepository, mailer);

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
    const { status, message, token } = await loginUser(req, userRepository);

    res.status(status).json({
      message: message,
      token: token,
    });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }
};

export const passwordRecoveryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { status, message } = await passwordRecovery(
      req,
      userRepository,
      mailer
    );

    res.status(status).json({ message: message });
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
    const { status, message } = await passwordReset(req, userRepository);
    res.status(status).json({ message: message });
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
    const { status, message } = await deleteUser(req, userRepository);
    res.status(status).json({ message: message });
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
    console.log('Here');
    const isValid = await verifyToken(req, userRepository);
    res.status(200).json({ isValid: isValid });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }
};
