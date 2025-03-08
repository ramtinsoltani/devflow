import { Router, Response } from "express";
import { ICollection } from "../models/normalized";
import { asyncHandler } from "../lib/async-handler";
import { DeleteCollectionRequest, GetCollectionsRequest, NewCollectionRequest, UpdateCollectionRequest } from "../models/requests";
import { IResponseGeneralMessage } from "../models/responses";
import { ValidatorSchema } from "../services/validator";

export const CollectionRouter = Router();

CollectionRouter.get('/:spaceId/collections', asyncHandler(async (req: GetCollectionsRequest, res: Response<ICollection[]>) => {

  res.json(await services.db.getCollections(req.params.spaceId));

}));

CollectionRouter.post('/:spaceId/collection', asyncHandler(async (req: NewCollectionRequest, res: Response<IResponseGeneralMessage<string>>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestNewCollection);

  const id = await services.db.createCollection(req.params.spaceId, req.body);

  res.json({
    message: `Collection successfully created`,
    data: id
  });

}));

CollectionRouter.put('/:spaceId/collection/:id', asyncHandler(async (req: UpdateCollectionRequest, res: Response<IResponseGeneralMessage>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestUpdateCollection);

  await services.db.updateCollection(req.params.spaceId, req.params.id, req.body);

  res.json({
    message: 'Collection successfully updated'
  });

}));

CollectionRouter.delete('/:spaceId/collection/:id', asyncHandler(async (req: DeleteCollectionRequest, res: Response<IResponseGeneralMessage>) => {

  await services.db.deleteCollection(req.params.spaceId, req.params.id);

  res.json({
    message: 'Collection deleted successfully'
  });

}));