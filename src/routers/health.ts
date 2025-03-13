import { Router, Response } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";

export const HealthRouter = Router();

HealthRouter.get('/health', asyncHandler(async (req: Request, res: Response) => {

  res.json({ message: 'OK' });

}));