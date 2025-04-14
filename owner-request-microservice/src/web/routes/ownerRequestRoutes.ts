import { Request, Response, Router } from "express";

const router = Router();

router.post("/owner-requests/create", async (req: Request, res: Response) => {
  res.status(200).send("create");
});

router.get("/owner-requests/all", async (req: Request, res: Response) => {
  res.status(200).send("all");
});

router.get("/owner-requests/:id", async (req: Request, res: Response) => {
  res.status(200).send("id");
});

export default router;
