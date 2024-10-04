import { Router, Response } from "express";
import { asyncHandler } from "../lib/async-handler";
import { FetchMetadataRequest } from "../models/requests";
import urlMetadata from "url-metadata";
import { IResponseUrlMetadata } from "../models/responses";
import { ServerError } from "../lib/error";

export const UtilitiesRouter = Router();

UtilitiesRouter.post('/utils/metadata', asyncHandler(async (req: FetchMetadataRequest, res: Response<IResponseUrlMetadata>) => {

  const urlMetadataOptions: urlMetadata.Options = {
    mode: 'same-origin',
    descriptionLength: 512,
    timeout: 5000
  };

  let result: urlMetadata.Result | undefined;
  let originResult: urlMetadata.Result | undefined;
  let urlError: Error | undefined;
  let originError: Error | undefined;

  try {

    // Get URL metadata
    result = await urlMetadata(req.body.url, urlMetadataOptions);

  }
  catch (error) {

    console.warn('URL metadata fetch failed:', error);
    urlError = error as Error;

  }

  try {

    // Get URL's origin metadata
    originResult = await urlMetadata(new URL(req.body.url).origin, urlMetadataOptions);

  }
  catch (error) {

    console.warn('Origin URL metadata fetch failed:', error);
    originError = error as Error;

  }

  if ( urlError && originError )
    throw new ServerError('internal', `Fetching URL metadata resulted in error: ${urlError.message === originError.message ? urlError.message : [urlError.message, originError.message].join(', ')}`);

  const metadata: IResponseUrlMetadata = {};

  if ( result ) {

    metadata.title = result['og:title'] || result['twitter:title'] || result.title;
    metadata.description = result['od:description'] || result['twitter:description'] || result.description;
    metadata.posterUrl = result['og:image'] || result['twitter:image'];

    // Validate poster URL
    try {

      // Resolve poster URLs using the provided URL as base if necessary
      if ( metadata.posterUrl?.length )
        metadata.posterUrl = new URL(metadata.posterUrl, req.body.url).href;

      // Handle multiple posters
      metadata.posterUrl = metadata.posterUrl?.replaceAll(',http', '\nhttp').split('\n')[0]

    }
    catch (error) {

      console.warn('Invalid poster URL:', metadata.posterUrl);
      metadata.posterUrl = undefined;

    }

  }

  if ( originResult ) {

    metadata.originTitle = originResult['og:title'] || originResult['twitter:title'] || originResult.title;
    metadata.originUrl = new URL(req.body.url).origin;

  }

  // Find best favicon
  const favicons: { svg?: string, png: { url: string, size: number }[], ico?: string } = {
    png: []
  };

  for ( const icon of originResult?.favicons || [] ) {

    let url!: URL;

    if ( ! icon.rel?.includes('icon') || typeof icon.href !== 'string' )
      continue;

    try {

      url = new URL(icon.href, metadata.originUrl);

    }
    catch (error) {

      continue;

    }

    if ( ! favicons.svg && (icon.type === 'image/svg+xml' || (! icon.type && url.pathname.endsWith('.svg'))) )
      favicons.svg = url.href;

    // Push all PNGs into array
    if ( icon.type === 'image/png' || (! icon.type && url.pathname.endsWith('.png')) )
      favicons.png.push({ url: url.href, size: parseInt(icon.sizes?.match(/^(?<width>\d+)x\d+$/i)?.groups?.width || 0) });

    if ( ! favicons.ico && (icon.type === 'image/x-icon' || (! icon.type && url.pathname.endsWith('.ico'))) )
      favicons.ico = url.href;

  }

  // Pick best PNG (128px size and above or the size closest to 128px)
  let bestPNG: string | undefined = undefined;

  favicons.png.sort();

  for ( const png of favicons.png ) {

    if ( png.size >= 128 ) {

      bestPNG = png.url;
      break;

    }

    bestPNG = png.url;

  }

  metadata.favicon = favicons.svg || bestPNG || favicons.ico;

  res.json(metadata);

}));