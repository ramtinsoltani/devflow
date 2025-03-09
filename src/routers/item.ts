import { Router, Response } from "express";
import { IItem } from "../models/normalized";
import { asyncHandler } from "../lib/middleware/async-handler";
import { DeleteItemRequest, GetItemRequest, GetItemsRequest, NewItemRequest, UpdateItemRequest } from "../models/requests";
import { IResponseGeneralMessage } from "../models/responses";
import { ValidatorSchema } from "../services/validator";
import { protectedRoute } from "../lib/middleware/auth";

export const ItemRouter = Router();

// Make all routes protected
ItemRouter.use(protectedRoute);

ItemRouter.get('/:spaceId/item/:id', asyncHandler(async (req: GetItemRequest, res: Response<IItem>) => {

  const item = await services.db.getItem(req.token, req.params.spaceId, req.params.id);

  res.json(item);

}));

ItemRouter.get('/:spaceId/items/:collectionId', asyncHandler(async (req: GetItemsRequest, res: Response<IItem[]>) => {

  const items = await services.db.getItems(req.token, req.params.spaceId, req.params.collectionId);

  res.json(items);
  
}));

ItemRouter.post('/:spaceId/item', asyncHandler(async (req: NewItemRequest, res: Response<IResponseGeneralMessage<string>>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestNewItem);

  const id = await services.db.createItem(req.token, req.params.spaceId, req.body);

  res.json({
    message: 'Item created successfully',
    data: id
  });

}));

ItemRouter.put('/:spaceId/item/:id', asyncHandler(async (req: UpdateItemRequest, res: Response<IResponseGeneralMessage>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestUpdateItem);

  await services.db.updateItem(req.token, req.params.spaceId, req.params.id, req.body);

  res.json({
    message: 'Updated item successfully'
  });

}));

ItemRouter.delete('/:spaceId/item/:id', asyncHandler(async (req: DeleteItemRequest, res: Response<IResponseGeneralMessage>) => {

  await services.db.deleteItem(req.token, req.params.spaceId, req.params.id);

  res.json({
    message: 'Item deleted successfully'
  });

}));