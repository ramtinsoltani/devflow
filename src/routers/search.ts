import { Router, Response } from "express";
import { ICollection, IItem, ISpace } from "../models/normalized";
import { asyncHandler } from "../lib/middleware/async-handler";
import { SearchCollectionItemsRequest, SearchCollectionsRequest, SearchItemsRequest, SearchSpacesRequest } from "../models/requests";
import { queryArrayParserMiddleware } from "../lib/utilities";
import { protectedRoute } from "../lib/middleware/auth";

export const SearchRouter = Router();

// Make all routes protected
SearchRouter.use(protectedRoute);

SearchRouter.get('/:spaceId/:collectionId/search/items',
  queryArrayParserMiddleware('tags'),
  asyncHandler(async (req: SearchCollectionItemsRequest, res: Response<IItem[]>) => {

    const result = await services.db.searchCollectionItems(req.token, req.params.spaceId, req.params.collectionId, req.query.q, req.query.tags);

    res.json(result);

  })
);

SearchRouter.get('/:spaceId/search/items',
  queryArrayParserMiddleware('tags'),
  asyncHandler(async (req: SearchItemsRequest, res: Response<IItem[]>) => {

    const result = await services.db.searchItems(req.token, req.params.spaceId, req.query.q, req.query.tags);

    res.json(result);

  })
);