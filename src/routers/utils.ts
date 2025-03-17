import { Router, Response } from "express";
import { getLinkPreview } from "link-preview-js";
import { asyncHandler } from "../lib/middleware/async-handler";
import { FetchMetadataRequest } from "../models/requests";
import { IResponseUrlMetadata } from "../models/responses";
import { ServerError } from "../lib/error";
import { ValidatorSchema } from "../services/validator";
import { protectedRoute } from "../lib/middleware/auth";
import { isDataURI } from "validator";

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

  // If Youtube link (full or short)
  if ( originUrl.match(/^http(s)?:\/\/(www\.)?youtube\..{2,}$/i) || originUrl.match(/^http(s)?:\/\/youtu.be$/i) ) {

    try {

      const youtubeUrl = new URL(req.body.url);
      const videoId = youtubeUrl.searchParams.get('v') || youtubeUrl.pathname.substring(1);

      // If video ID was extracted and we have Youtube Data API v3 token set
      if ( videoId && process.env.YOUTUBE_DATA_API_V3_TOKEN ) {

        const response = await fetch(`https://content-youtube.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${process.env.YOUTUBE_DATA_API_V3_TOKEN}`, {
          method: 'GET'
        });

        const data: YoutubeAPIVideoResponse = await response.json();

        if ( data.items.length && data.items[0].id === videoId ) {

          youtubePreviewResult.title = data.items[0].snippet.title;
          youtubePreviewResult.description = data.items[0].snippet.description;
          youtubePreviewResult.images = [
            data.items[0].snippet.thumbnails.maxres.url
          ];

          isYoutube = true;

        }

      }

    }
    catch (error) {

      console.error('Error fetching Youtube data:', error);

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

  // Normalize
  if ( metadata.title?.length )
    metadata.title = metadata.title.substring(0, 256);
  else
    delete metadata.title;

  if ( metadata.description?.length )
    metadata.description = metadata.description.substring(0, 1024);
  else
    delete metadata.description;

  if ( metadata.posterUrl?.length ) {

    if ( isDataURI(metadata.posterUrl) && metadata.posterUrl.length > 1024 )
      delete metadata.posterUrl;
    else
      metadata.posterUrl = metadata.posterUrl.substring(0, 1024);

  }
  else
    delete metadata.posterUrl;

  if ( metadata.originTitle?.length )
    metadata.originTitle = metadata.originTitle.substring(0, 256);
  else
    delete metadata.originTitle;

  if ( metadata.originUrl?.length )
    metadata.originUrl = metadata.originUrl.substring(0, 1024);
  else
    delete metadata.originUrl;

  if ( metadata.favicon?.length )
    metadata.favicon = metadata.favicon.substring(0, 1024);
  else
    delete metadata.favicon;

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

interface YoutubeAPIVideoResponse {
  items: {
    id: string,
    snippet: {
      title: string,
      description: string,
      thumbnails: {
        default: YoutubeThumbnail,
        medium: YoutubeThumbnail,
        high: YoutubeThumbnail,
        standard: YoutubeThumbnail,
        maxres: YoutubeThumbnail
      }
    }
  }[]
}

interface YoutubeThumbnail {
  url: string,
  width: number,
  height: number
}