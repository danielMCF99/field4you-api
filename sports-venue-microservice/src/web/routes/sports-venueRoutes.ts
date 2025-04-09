import { Request, Response, Router } from 'express';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  createSportsVenueController,
  deleteSportsVenueController,
  getAllSportsVenueController,
  getSportsVenueByIdController,
  updateSportsVenueController,
  updateSportsVenueStatusController,
} from '../controllers/sports-venueController';

const router = Router();

router.get('/sports-venues/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

router.post('/sports-venues/create', createSportsVenueController);
router.put('/sports-venues/:id/status', updateSportsVenueStatusController);
router.put('/sports-venues/:id', updateSportsVenueController);
router.get('/sports-venues/all', getAllSportsVenueController);
router.get('/sports-venues/:id', getSportsVenueByIdController);
router.delete('/sports-venues/:id', deleteSportsVenueController);
//router.post("/sports-venue/query", query-sports-venue);
//router.post("/sports-venue/:id/schedule", create-query-sports-venue);
//router.put("/sports-venue/:id/schedule/:id", update-sports-venue-schedule);
//router.put("/sports-venue/:id/schedule/:id/status", update-sports-venue-schedule-status);

export default router;
