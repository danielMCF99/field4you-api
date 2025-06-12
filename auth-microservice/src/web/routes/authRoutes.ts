import express, { Request, Response } from 'express';
import swaggerDocument from '../../docs/swagger/swagger.json';
import multer from 'multer';

import {
  activeUsersController,
  loginUserController,
  passwordRecoveryController,
  passwordResetController,
  registerUserController,
  registerUsersFromCSVController,
} from '../controllers/authController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRoutes = express.Router();

userRoutes.post('/auth/register-from-csv', upload.single('file'), registerUsersFromCSVController);
userRoutes.get('/auth/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});
userRoutes.post('/auth/register', registerUserController);
userRoutes.post('/auth/login', loginUserController);
userRoutes.post('/auth/password-recovery', passwordRecoveryController);
userRoutes.put('/auth/reset-password', passwordResetController);
userRoutes.get('/auth/active-users', activeUsersController);

export default userRoutes;
