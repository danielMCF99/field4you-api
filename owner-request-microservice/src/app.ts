import express, { Application } from "express";
import { MongoOwnerRequestRepository } from "./infrastructure/repositories/MongoOwnerRequestRepository";
import ownerRequestRoutes from "./web/routes/ownerRequestRoutes";

const app: Application = express();
export const ownerRequestRepository = MongoOwnerRequestRepository.getInstance();

app.use(express.json());

app.use(ownerRequestRoutes);

export default app;
