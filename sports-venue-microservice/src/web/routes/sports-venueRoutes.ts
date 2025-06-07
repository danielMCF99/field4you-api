import { Request, Response, Router } from 'express';
import multer from 'multer';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  createSportsVenueController,
  deleteSportsVenueController,
  deleteSportsVenueImageController,
  getAllDistrictsController,
  getAllSportsVenueController,
  getSportsVenueByIdController,
  getSportsVenueScheduleController,
  getSportsVenueTotalPlayersController,
  updateSportsVenueController,
  updateSportsVenueImageController,
  updateSportsVenueRatingController,
  updateSportsVenueScheduleController,
  updateSportsVenueStatusController,
} from '../controllers/sports-venueController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get('/sports-venues/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

router.post('/sports-venues/create', createSportsVenueController);
router.patch('/sports-venues/:id/status', updateSportsVenueStatusController);
router.patch('/sports-venues/:id/rating', updateSportsVenueRatingController);
router.put('/sports-venues/:id', updateSportsVenueController);
router.get('/sports-venues', getAllSportsVenueController);
router.get(
  '/sports-venues/total-players',
  getSportsVenueTotalPlayersController
);
router.get('/sports-venues/districts', getAllDistrictsController);
router.get('/sports-venues/:id', getSportsVenueByIdController);
router.delete('/sports-venues/:id', deleteSportsVenueController);
router.patch(
  '/sports-venues/:id/image',
  upload.array('image'),
  updateSportsVenueImageController
);
router.delete(
  '/sports-venues/:id/image/:imageId',
  deleteSportsVenueImageController
);
router.patch(
  '/sports-venues/:id/schedule',
  updateSportsVenueScheduleController
);
router.get('/sports-venues/:id/schedule', getSportsVenueScheduleController);

export default router;
