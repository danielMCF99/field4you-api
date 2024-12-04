import express from 'express';
import {
  createUserController,
  deleteUserController,
  getAllController,
  getByIdController,
  updateUserController,
} from '../controllers/userController';

const userRoutes = express.Router();

userRoutes.post('/users/create', createUserController);
userRoutes.get('/users/all', getAllController);
userRoutes.get('/users/:id', getByIdController);
userRoutes.put('/users/:id', updateUserController);
userRoutes.delete('/users/:id', deleteUserController);

export default userRoutes;
