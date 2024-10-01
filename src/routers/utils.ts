import { Router, Response } from "express";
import { asyncHandler } from "../lib/async-handler";
import { FetchMetadataRequest } from "../models/requests";
import urlMetadata from "url-metadata";
import { IResponseUrlMetadata } from "../models/responses";

export const UtilitiesRouter = Router();

UtilitiesRouter.post('/utils/metadata', asyncHandler(async (req: FetchMetadataRequest, res: Response<IResponseUrlMetadata>) => {

  const result = await urlMetadata(req.body.url, { mode: 'same-origin' });
  const metadata: IResponseUrlMetadata = {
    title: result['og:title'] || result['twitter:title'] || result.title,
    description: result['od:description'] || result['twitter:description'] || result.description,
    posterUrl: result['og:image'] || result['twitter:image']
  };

  // Resolve poster URLs using the provided URL as base if necessary
  if ( metadata.posterUrl?.length )
    metadata.posterUrl = new URL(metadata.posterUrl, req.body.url).href;

  res.json(metadata);

}));