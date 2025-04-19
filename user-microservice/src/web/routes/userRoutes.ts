import express, { Request, Response } from 'express';
import {
  deleteUserController,
  getAllController,
  getByIdController,
  updateUserController,
} from '../controllers/userController';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  createOwnerRequestController,
  getAllOwnerRequestsController,
  getOwnerRequestController,
  getOwnerRequestsByUserIdController,
  updateOwnerRequestController,
} from '../controllers/ownerRequestController';

const userRoutes = express.Router();

userRoutes.get('/users/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

userRoutes.get('/users', getAllController);
userRoutes.get('/users/:id', getByIdController);
userRoutes.put('/users/:id', updateUserController);
userRoutes.delete('/users/:id', deleteUserController);

userRoutes.post('/users/owner-requests/create', createOwnerRequestController);

userRoutes.get('/users/owner-requests/all', getAllOwnerRequestsController);

userRoutes.get('/users/owner-requests/:id', getOwnerRequestController);

userRoutes.get(
  '/users/:userId/owner-requests',
  getOwnerRequestsByUserIdController
);

userRoutes.patch('/users/owner-requests/:id', updateOwnerRequestController);

export default userRoutes;
