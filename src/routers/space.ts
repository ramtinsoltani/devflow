import { Request, Response, Router } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";
import { ISpace } from "../models/normalized";
import { AuthorizedRequest, DeleteSpaceRequest, NewSpaceRequest, UpdateSpaceRequest } from "../models/requests";
import { IResponseGeneralMessage } from "../models/responses";
import { ValidatorSchema } from "../services/validator";
import { protectedRoute } from "../lib/middleware/auth";

export const SpaceRouter = Router();

// Make all routes protected
SpaceRouter.use(protectedRoute);

SpaceRouter.get('/spaces', asyncHandler(async (req: AuthorizedRequest, res: Response<ISpace[]>) => {

  res.json(await services.db.getSpaces(req.token));

}));

SpaceRouter.post('/space', asyncHandler(async (req: NewSpaceRequest, res: Response<IResponseGeneralMessage<string>>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestNewSpace);

  const id = await services.db.createSpace(req.token, req.body);

  res.json({
    message: 'Space successfully created',
    data: id
  });

}));

SpaceRouter.put('/space/:id', asyncHandler(async (req: UpdateSpaceRequest, res: Response<IResponseGeneralMessage>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestUpdateSpace);

  await services.db.updateSpace(req.token, req.params.id, req.body);

  res.json({
    message: 'Space successfully updated'
  });

}));

SpaceRouter.delete('/space/:id', asyncHandler(async (req: DeleteSpaceRequest, res: Response<IResponseGeneralMessage>) => {

  await services.db.deleteSpace(req.token, req.params.id);

  res.json({
    message: 'Space successfully deleted'
  });

}));