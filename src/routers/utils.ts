import { Router, Response } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";
import { FetchMetadataRequest } from "../models/requests";
import { IResponseUrlMetadata } from "../models/responses";
import { ServerError } from "../lib/error";
import { getLinkPreview } from "link-preview-js";
import { ValidatorSchema } from "../services/validator";
import { protectedRoute } from "../lib/middleware/auth";

export const UtilitiesRouter = Router();

// Make all routes protected
UtilitiesRouter.use(protectedRoute);

UtilitiesRouter.post('/utils/metadata', asyncHandler(async (req: FetchMetadataRequest, res: Response<IResponseUrlMetadata>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestFetchMetadata);

  console.log('>>> Request validated');

  const previewOptions: any = {
    headers: {
      'user-agent': 'google-bot',
      origin: new URL(req.body.url).origin
    },
    followRedirects: 'follow'
  };

  console.log('>>> previewOptions:', previewOptions);
  
  const previewResults = await Promise.allSettled([
    // Link preview
    getLinkPreview(req.body.url, previewOptions),
    // Link's origin preview
    getLinkPreview(new URL(req.body.url).origin, previewOptions)
  ]);

  console.log('>>> Got results');

  // Show warnings for each failed preview fetch
  for ( const result of previewResults ) {

    if ( result.status === 'rejected' )
      console.warn('URL metadata fetch failed:', result.reason);

  }

  const result = previewResults[0].status === 'fulfilled' ? previewResults[0].value as LinkPreviewResult : null;
  const originResult = previewResults[1].status === 'fulfilled' ? previewResults[1].value as LinkPreviewResult : null;

  // If both failed, throw error
  if ( previewResults.reduce((a, b) => a && b.status === 'rejected', true) ) {

    throw new ServerError('internal', `Fetching URL metadata resulted in error: ${
      (previewResults[0] as PromiseRejectedResult).reason.message === (previewResults[1] as PromiseRejectedResult).reason.message ?
        (previewResults[0] as PromiseRejectedResult).reason.message :
        [(previewResults[0] as PromiseRejectedResult).reason.message, (previewResults[1] as PromiseRejectedResult).reason.message].join(', ')
    }`);

  }

  console.log('>>> Reading link preview data...');

  const metadata: IResponseUrlMetadata = {};

  // Read link preview
  if ( result ) {

    metadata.title = result.title || result.siteName;
    metadata.description = result.description;
    metadata.posterUrl = result.images?.at(0);

    // Sanitize poster URL
    try {

      if ( ! metadata.posterUrl?.trim() )
        metadata.posterUrl = undefined;

      // Resolve poster URLs using the provided URL as base if necessary
      if ( metadata.posterUrl?.length )
        metadata.posterUrl = new URL(metadata.posterUrl, req.body.url).href;

      // Handle multiple posters
      metadata.posterUrl = metadata.posterUrl?.replaceAll(',http', '\nhttp').split('\n')[0];

    }
    catch (error) {

      console.warn('Invalid poster URL:', metadata.posterUrl);
      metadata.posterUrl = undefined;

    }

  }

  // Read origin link preview
  if ( originResult ) {

    metadata.originTitle = originResult.siteName || originResult.title;
    metadata.originUrl = new URL(req.body.url).origin;

  }

  console.log('>>> Resolving favicon');

  // Find the best favicon
  const favicons: { svg?: string, png: { url: string, size: number }[], ico?: string } = {
    png: []
  };
  
  for ( const icon of (result || originResult || {}).favicons || [] ) {

    let url!: URL;

    try {

      url = new URL(icon, metadata.originUrl);

    }
    catch (error) {

      continue;

    }

    if ( ! favicons.svg && url.pathname.endsWith('.svg') )
      favicons.svg = url.href;

    // Push all PNGs into array
    if ( url.pathname.endsWith('.png') )
      favicons.png.push({ url: url.href, size: parseInt(url.pathname.match(/(?<size>\d+)/i)?.groups?.size || '0') });

    if ( ! favicons.ico && url.pathname.endsWith('.ico') )
      favicons.ico = url.href;

  }

  // Pick best PNG (128px size and above or the size closest to 128px)
  let bestPNG: string | undefined = undefined;

  favicons.png.sort((a, b) => b.size - a.size);

  for ( const png of favicons.png ) {

    if ( png.size >= 128 ) {

      bestPNG = png.url;
      break;

    }

    bestPNG = png.url;

  }

  metadata.favicon = favicons.svg || bestPNG || favicons.ico || new URL(req.body.url).origin + '/favicon.ico';

  console.log('>>> Responding with results');

  res.json(metadata);

}));

interface LinkPreviewResult {
  url: string,
  title?: string,
  siteName?: string,
  description?: string,
  images?: string[],
  mediaType?: string,
  contentType?: string,
  charset?: string
  videos?: string[],
  favicons?: string[]
}