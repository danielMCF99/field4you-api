import express, { Request, Response } from 'express';
import multer from 'multer';
import {
  deleteUserController,
  getAllController,
  getByIdController,
  updateUserController,
  updateUserImageController,
  updateUserStatusController,
} from '../controllers/userController';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  createOwnerRequestController,
  getAllOwnerRequestsController,
  getOwnerRequestController,
  getOwnerRequestsByUserIdController,
  updateOwnerRequestController,
} from '../controllers/ownerRequestController';
import { getNotificationsByUserId } from '../../application/use-cases/notifications/getNotificationsByUserId';
import {
  getAllByUseIdController,
  updateNotificationStatusController,
} from '../controllers/notificationController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRoutes = express.Router();

// Swagger
userRoutes.get('/users/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

// Notifications
userRoutes.get('/users/notifications', getAllByUseIdController);
userRoutes.patch(
  '/users/notifications/:id/status',
  updateNotificationStatusController
);

// Owner Requests
userRoutes.post('/users/owner-requests/create', createOwnerRequestController);
userRoutes.get('/users/owner-requests/all', getAllOwnerRequestsController);
userRoutes.get('/users/owner-requests/:id', getOwnerRequestController);
userRoutes.get(
  '/users/:userId/owner-requests',
  getOwnerRequestsByUserIdController
);
userRoutes.patch('/users/owner-requests/:id', updateOwnerRequestController);

// Users
userRoutes.get('/users', getAllController);
userRoutes.patch('/users/status', updateUserStatusController);
userRoutes.patch(
  '/users/:id/image',
  upload.single('image'),
  updateUserImageController
);
userRoutes.get('/users/:id', getByIdController);
userRoutes.put('/users/:id', updateUserController);
userRoutes.delete('/users/:id', deleteUserController);

export default userRoutes;
