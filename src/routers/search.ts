import { Router, Response } from "express";
import { ICollection, IItem } from "../models/normalized";
import { asyncHandler } from "../lib/async-handler";
import { DatabaseService } from "../services/database";
import { SearchCollectionItemsRequest, SearchCollectionsRequest, SearchItemsRequest } from "../models/requests";

const db = new DatabaseService();
export const SearchRouter = Router();

SearchRouter.get('/search/collections', asyncHandler(async (req: SearchCollectionsRequest, res: Response<ICollection[]>) => {

  const result = await db.searchCollections(req.query.q);

  res.json(result);

}));

SearchRouter.get('/search/items/:collectionId', asyncHandler(async (req: SearchCollectionItemsRequest, res: Response<IItem[]>) => {

  const result = await db.searchCollectionItems(req.params.collectionId, req.query.q, req.query.tags);

  res.json(result);

}));

SearchRouter.get('/search/items', asyncHandler(async (req: SearchItemsRequest, res: Response<IItem[]>) => {

  const result = await db.searchItems(req.query.q, req.query.tags);

  res.json(result);

}));