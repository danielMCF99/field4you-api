import { Router } from 'express';
import {
  createSportsVenueController,
  updateSportsVenueController,
  getSportsVenueByIdController,
  deleteSportsVenueController,
} from '../controllers/sports-venueController';

const router = Router();

router.post('/sports-venues/create', createSportsVenueController);
router.put('/sports-venues/:id', updateSportsVenueController);
router.get('/sports-venues/:id', getSportsVenueByIdController);
router.delete('/sports-venues/:id', deleteSportsVenueController);
//router.put("/sports-venue/:id/status", update-sports-venue-status);
//router.post("/sports-venue/query", query-sports-venue);
//router.post("/sports-venue/:id/schedule", create-query-sports-venue);
//router.put("/sports-venue/:id/schedule/:id", update-sports-venue-schedule);
//router.put("/sports-venue/:id/schedule/:id/status", update-sports-venue-schedule-status);

export default router;
