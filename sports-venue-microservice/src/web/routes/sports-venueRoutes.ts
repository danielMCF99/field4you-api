import { Request, Response, Router } from 'express';
import multer from 'multer';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  createSportsVenueController,
  deleteSportsVenueController,
  deleteSportsVenueImageController,
  getAllSportsVenueController,
  getSportsVenueByIdController,
  updateSportsVenueController,
  updateSportsVenueStatusController,
  updateSportsVenueImageController
} from '../controllers/sports-venueController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get('/sports-venues/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

router.post('/sports-venues/create', createSportsVenueController);
router.patch('/sports-venues/:id/status', updateSportsVenueStatusController);
router.put('/sports-venues/:id', updateSportsVenueController);
router.get('/sports-venues', getAllSportsVenueController);
router.get('/sports-venues/:id', getSportsVenueByIdController);
router.delete('/sports-venues/:id', deleteSportsVenueController);
router.patch('/sports-venues/:id/image', upload.array('image'), updateSportsVenueImageController);
router.delete('/sports-venues/:id/image/:imageId', deleteSportsVenueImageController);

//router.post("/sports-venue/query", query-sports-venue);
//router.post("/sports-venue/:id/schedule", create-query-sports-venue);
//router.put("/sports-venue/:id/schedule/:id", update-sports-venue-schedule);
//router.put("/sports-venue/:id/schedule/:id/status", update-sports-venue-schedule-status);

export default router;
