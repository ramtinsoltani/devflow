import { Router, Request, Response } from "express";
import { IItem } from "../models/normalized";
import { asyncHandler } from "../lib/async-handler";
import { DatabaseService } from "../services/database";
import { DeleteItemRequest, GetItemsRequest, NewItemRequest, UpdateItemRequest } from "../models/requests";
import { IResponseGeneralMessage } from "../models/responses";

const db = new DatabaseService();
export const ItemRouter = Router();

ItemRouter.get('/items/:collectionId', asyncHandler(async (req: GetItemsRequest, res: Response<IItem[]>) => {

  const items = await db.getItems(req.params.collectionId);

  res.json(items);
  
}));

ItemRouter.post('/item', asyncHandler(async (req: NewItemRequest, res: Response<IResponseGeneralMessage<string>>) => {

  const id = await db.createItem(req.body);

  res.json({
    message: 'Item created successfully',
    data: id
  });

}));

ItemRouter.put('/item/:id', asyncHandler(async (req: UpdateItemRequest, res: Response<IResponseGeneralMessage>) => {

  await db.updateItem(req.params.id, req.body);

  res.json({
    message: 'Updated item successfully'
  });

}));

ItemRouter.delete('/item/:id', asyncHandler(async (req: DeleteItemRequest, res: Response<IResponseGeneralMessage>) => {

  await db.deleteItem(req.params.id);

  res.json({
    message: 'Item deleted successfully'
  });

}));