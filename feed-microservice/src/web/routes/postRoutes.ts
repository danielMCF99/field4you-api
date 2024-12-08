import express, { Request, Response } from 'express';
import multer from 'multer';
import {
  createPostController,
  deletePostController,
  getLast10PostController,
} from '../controllers/postController';
import swaggerDocument from '../../docs/swagger/swagger.json';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const postRoutes = express.Router();

postRoutes.get('/posts/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

postRoutes.post('/posts/create', upload.single('image'), createPostController);
postRoutes.get('/posts/last10', getLast10PostController);
postRoutes.delete('/posts/:id', deletePostController);

export default postRoutes;
