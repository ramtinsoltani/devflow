import { Router, Response } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";
import { protectedRoute } from "../lib/middleware/auth";
import { ReorderCollectionRequest, ReorderItemRequest, ReorderSpaceRequest } from "../models/requests";
import { ValidatorSchema } from "../services/validator";

export const ReorderRouter = Router();

// Make all routes protected
ReorderRouter.use(protectedRoute);

ReorderRouter.patch('/reorder/:spaceId', asyncHandler(async (req: ReorderSpaceRequest, res: Response) => {

  services.validator.validate(req.body, ValidatorSchema.RequestReorder);

  await services.db.reorderSpace(req.token, req.params.spaceId, req.body);

  res.json({ message: 'Space reordered successfully' });

}));

ReorderRouter.patch('/reorder/:spaceId/:collectionId', asyncHandler(async (req: ReorderCollectionRequest, res: Response) => {

  services.validator.validate(req.body, ValidatorSchema.RequestReorder);

  await services.db.reorderCollection(req.token, req.params.spaceId, req.params.collectionId, req.body);

  res.json({ message: 'Collection reordered successfully' });

}));

ReorderRouter.patch('/reorder/:spaceId/:collectionId/:itemId', asyncHandler(async (req: ReorderItemRequest, res: Response) => {

  services.validator.validate(req.body, ValidatorSchema.RequestReorder);

  await services.db.reorderItem(req.token, req.params.spaceId, req.params.collectionId, req.params.itemId, req.body);

  res.json({ message: 'Item reordered successfully' });

}));