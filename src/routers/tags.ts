import { Router, Response } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";
import { protectedRoute } from "../lib/middleware/auth";
import { GetTagColorRequest } from "../models/requests";
import { IResponseColor } from "../models/responses";

export const TagsRouter = Router();

// Make all routes protected
TagsRouter.use(protectedRoute);

TagsRouter.get('/tags/:spaceId/color/:label', asyncHandler(async (req: GetTagColorRequest, res: Response<IResponseColor>) => {

  const color = await services.db.getTagColor(req.token, req.params.spaceId, req.params.label, req.query.exclude);

  res.json({ color });

}));
