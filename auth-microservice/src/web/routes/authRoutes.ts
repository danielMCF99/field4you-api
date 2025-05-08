import express, { Request, Response } from 'express';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  activeUsersController,
  loginUserController,
  passwordRecoveryController,
  passwordResetController,
  registerUserController,
} from '../controllers/authController';

const userRoutes = express.Router();

userRoutes.get('/auth/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});
userRoutes.post('/auth/register', registerUserController);
userRoutes.post('/auth/login', loginUserController);
userRoutes.post('/auth/password-recovery', passwordRecoveryController);
userRoutes.put('/auth/reset-password/*', passwordResetController);
userRoutes.get('/auth/active-users', activeUsersController);

export default userRoutes;
