import express from 'express';
import {
  registerUserController,
  loginUserController,
  passwordRecoveryController,
  passwordResetController,
  deleteUserController,
} from '../controllers/authController';

const userRoutes = express.Router();

userRoutes.post('/auth/register', registerUserController);
userRoutes.post('/auth/login', loginUserController);
userRoutes.post('/auth/password-recovery', passwordRecoveryController);
userRoutes.put('/auth/reset-password/*', passwordResetController);
userRoutes.delete('/auth/:id', deleteUserController);

export default userRoutes;
