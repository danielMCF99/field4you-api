import express, { Request, Response } from 'express';
import {
  registerUserController,
  loginUserController,
  passwordRecoveryController,
  passwordResetController,
  deleteUserController,
  verifyTokenController,
} from '../controllers/authController';
import swaggerDocument from '../../docs/swagger/swagger.json';

const userRoutes = express.Router();

userRoutes.get('/auth/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});
userRoutes.post('/auth/register', registerUserController);
userRoutes.post('/auth/login', loginUserController);
userRoutes.post('/auth/password-recovery', passwordRecoveryController);
userRoutes.put('/auth/reset-password/*', passwordResetController);
userRoutes.delete('/auth/:id', deleteUserController);
userRoutes.post('/auth/verify-token', verifyTokenController);

export default userRoutes;
