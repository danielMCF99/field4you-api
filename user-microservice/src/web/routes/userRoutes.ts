import express, { Request, Response } from 'express';
import multer from 'multer';
import {
  deleteUserController,
  getAllController,
  getByIdController,
  updateUserController,
  updateUserImageController,
} from '../controllers/userController';
import swaggerDocument from '../../docs/swagger/swagger.json';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRoutes = express.Router();

userRoutes.get('/users/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

userRoutes.get('/users', getAllController);
userRoutes.get('/users/:id', getByIdController);
userRoutes.put('/users/:id', updateUserController);
userRoutes.delete('/users/:id', deleteUserController);
userRoutes.patch('/users/:id/image', upload.single('image'), updateUserImageController);

export default userRoutes;
