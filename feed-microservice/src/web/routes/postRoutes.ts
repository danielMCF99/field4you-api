import express from 'express';
import multer from 'multer';
import {
  createPostController,
  deletePostController,
  getLast10PostController,
} from '../controllers/postController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const postRoutes = express.Router();

postRoutes.post('/posts/create', upload.single('image'), createPostController);
postRoutes.get('/posts/last-10', getLast10PostController);
postRoutes.delete('/posts/:id', deletePostController);

export default postRoutes;
