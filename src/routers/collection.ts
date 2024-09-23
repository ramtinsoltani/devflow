import { Router, Request, Response } from "express";
import { ICollection } from "../models/normalized";
import { asyncHandler } from "../lib/async-handler";
import { DatabaseService } from "../services/database";
import { DeleteCollectionRequest, NewCollectionRequest, UpdateCollectionRequest } from "../models/requests";
import { IResponseGeneralMessage } from "../models/responses";

const db = new DatabaseService();
export const CollectionRouter = Router();

CollectionRouter.get('/collections', asyncHandler(async (req: Request, res: Response<ICollection[]>) => {

  res.json(await db.getCollections());

}));

CollectionRouter.post('/collection', asyncHandler(async (req: NewCollectionRequest, res: Response<IResponseGeneralMessage<string>>) => {

  const id = await db.createCollection(req.body);

  res.json({
    message: `Collection successfully created`,
    data: id
  });

}));

CollectionRouter.put('/collection/:id', asyncHandler(async (req: UpdateCollectionRequest, res: Response<IResponseGeneralMessage>) => {

  await db.updateCollection(req.params.id, req.body);

  res.json({
    message: 'Collection successfully updated'
  });

}));

CollectionRouter.delete('/collection/:id', asyncHandler(async (req: DeleteCollectionRequest, res: Response<IResponseGeneralMessage>) => {

  await db.deleteCollection(req.params.id);

  res.json({
    message: 'Collection deleted successfully'
  });

}));