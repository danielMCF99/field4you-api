import express, { Request, Response } from 'express';
import {
  createUserController,
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

userRoutes.post('/users/create', createUserController);
userRoutes.get('/users/all', getAllController);
userRoutes.get('/users/:id', getByIdController);
userRoutes.put('/users/:id', updateUserController);
userRoutes.delete('/users/:id', deleteUserController);

export default userRoutes;
