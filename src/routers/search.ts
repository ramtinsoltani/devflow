import { Router, Response } from "express";
import { ICollection, IItem, ISpace } from "../models/normalized";
import { asyncHandler } from "../lib/async-handler";
import { SearchCollectionItemsRequest, SearchCollectionsRequest, SearchItemsRequest, SearchSpacesRequest } from "../models/requests";
import { queryArrayParserMiddleware } from "../lib/utilities";

export const SearchRouter = Router();

SearchRouter.get('/search/spaces', asyncHandler(async (req: SearchSpacesRequest, res: Response<ISpace[]>) => {

  const result = await services.db.searchSpaces(req.query.q);

  res.json(result);

}));

SearchRouter.get('/:spaceId/search/collections', asyncHandler(async (req: SearchCollectionsRequest, res: Response<ICollection[]>) => {

  const result = await services.db.searchCollections(req.params.spaceId, req.query.q);

  res.json(result);

}));

SearchRouter.get('/:spaceId/:collectionId/search/items',
  queryArrayParserMiddleware('tags'),
  asyncHandler(async (req: SearchCollectionItemsRequest, res: Response<IItem[]>) => {

    const result = await services.db.searchCollectionItems(req.params.spaceId, req.params.collectionId, req.query.q, req.query.tags);

    res.json(result);

  })
);

SearchRouter.get('/:spaceId/search/items',
  queryArrayParserMiddleware('tags'),
  asyncHandler(async (req: SearchItemsRequest, res: Response<IItem[]>) => {

    const result = await services.db.searchItems(req.params.spaceId, req.query.q, req.query.tags);

    res.json(result);

  })
);