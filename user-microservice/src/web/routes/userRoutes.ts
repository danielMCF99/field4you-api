import express, { Request, Response } from 'express';
import {
  deleteUserController,
  getAllController,
  getByIdController,
  updateUserController,
} from '../controllers/userController';
import swaggerDocument from '../../docs/swagger/swagger.json';

const userRoutes = express.Router();

userRoutes.get('/users/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

userRoutes.get('/users', getAllController);
userRoutes.get('/users/:id', getByIdController);
userRoutes.put('/users/:id', updateUserController);
userRoutes.delete('/users/:id', deleteUserController);

export default userRoutes;
