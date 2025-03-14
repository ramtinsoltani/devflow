import { Router, Response } from "express";
import { getLinkPreview } from "link-preview-js";
import { getBasicInfo as youtubeBasicInfo } from "@distube/ytdl-core";
import { asyncHandler } from "../lib/middleware/async-handler";
import { FetchMetadataRequest } from "../models/requests";
import { IResponseUrlMetadata } from "../models/responses";
import { ServerError } from "../lib/error";
import { ValidatorSchema } from "../services/validator";
import { protectedRoute } from "../lib/middleware/auth";

export const UtilitiesRouter = Router();

// Make all routes protected
UtilitiesRouter.use(protectedRoute);

UtilitiesRouter.post('/utils/metadata', asyncHandler(async (req: FetchMetadataRequest, res: Response<IResponseUrlMetadata>) => {

  services.validator.validate(req.body, ValidatorSchema.RequestFetchMetadata);

  const originUrl = new URL(req.body.url).origin;

  const previewOptions: any = {
    headers: {
      'user-agent': 'google-bot',
      origin: originUrl
    },
    followRedirects: 'follow'
  };

  // Detect Youtube links
  let isYoutube: boolean = false;
  const youtubePreviewResult: LinkPreviewResult = {
    url: req.body.url,
    mediaType: 'video.other',
    contentType: 'text/html',
    siteName: 'YouTube',
    charset: 'utf-8',
    videos: []
  };

  if ( originUrl.match(/^http(s)?:\/\/(www\.)?youtube\..{2,}$/i) || originUrl.match(/^http(s)?:\/\/youtu.be$/i) ) {

    try {

      const info = await youtubeBasicInfo(req.body.url, { requestOptions: { headers: previewOptions.headers } });

      youtubePreviewResult.images = info.videoDetails.thumbnails
      .sort((a, b) => (b.height * b.width) - (a.height * a.width))
      .map(t => t.url);

      youtubePreviewResult.title = info.videoDetails.title;
      youtubePreviewResult.description = info.videoDetails.description || undefined;

      isYoutube = true;

    }
    catch (error) {

      console.error('Error fetching Youtube link:', error);

    }

  }
  
  const previewResults = await Promise.allSettled([
    // Link preview
    isYoutube ? Promise.resolve(youtubePreviewResult) : getLinkPreview(req.body.url, previewOptions),
    // Link's origin preview
    getLinkPreview(originUrl, previewOptions)
  ]);

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
    metadata.originUrl = originUrl;

  }

  // Find the best favicon
  const favicons: { svg?: string, png: { url: string, size: number }[], ico?: string } = {
    png: []
  };

  // Merge favicons (URL and origin) into one
  const sourceFavicons = [
    ...result?.favicons || [],
    ...originResult?.favicons || []
  ];
  
  for ( const icon of sourceFavicons ) {

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

  metadata.favicon = favicons.svg || bestPNG || favicons.ico || originUrl + '/favicon.ico';

  // Truncate
  if ( metadata.title?.length )
    metadata.title = metadata.title.substring(0, 256);

  if ( metadata.description?.length )
    metadata.description = metadata.description.substring(0, 1024);

  if ( metadata.posterUrl?.length )
    metadata.posterUrl = metadata.posterUrl.substring(0, 1024);

  if ( metadata.originTitle?.length )
    metadata.originTitle = metadata.originTitle.substring(0, 256);

  if ( metadata.originUrl?.length )
    metadata.originUrl = metadata.originUrl.substring(0, 1024);

  if ( metadata.favicon?.length )
    metadata.favicon = metadata.favicon.substring(0, 1024);

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