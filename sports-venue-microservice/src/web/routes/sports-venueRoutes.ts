import { Router, Request, Response } from "express";
import swaggerDocument from "../../docs/swagger/swagger.json";
import {
  createSportsVenueController,
  updateSportsVenueController,
  getSportsVenueByIdController,
  getAllSportsVenueController,
  deleteSportsVenueController,
} from "../controllers/sports-venueController";

const router = Router();

router.get("/sports-venues/swagger", async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

router.post("/sports-venues/create", createSportsVenueController);
router.put("/sports-venues/:id", updateSportsVenueController);
router.get("/sports-venues/all", getAllSportsVenueController);
router.get("/sports-venues/:id", getSportsVenueByIdController);
router.delete("/sports-venues/:id", deleteSportsVenueController);
//router.put("/sports-venue/:id/status", update-sports-venue-status);
//router.post("/sports-venue/query", query-sports-venue);
//router.post("/sports-venue/:id/schedule", create-query-sports-venue);
//router.put("/sports-venue/:id/schedule/:id", update-sports-venue-schedule);
//router.put("/sports-venue/:id/schedule/:id/status", update-sports-venue-schedule-status);

export default router;
