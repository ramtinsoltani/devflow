import { Request, Response, Router } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";
import { getPreviewFromContent } from "link-preview-js";

export const TestRouter = Router();

TestRouter.post('/proxy', asyncHandler(async (req: Request, res: Response) => {

  const response = await fetch(req.body.url, {
    method: 'GET',
    headers: {
      'user-agent': 'google-bot',
      origin: new URL(req.body.url).origin
    },
    redirect: 'follow'
  });

  const preview = await getPreviewFromContent({
    data: await response.text(),
    headers: {
      'content-type': response.headers.get('content-type') || 'text/html; charset=utf-8'
    },
    url: req.body.url
  });

  res.json(preview);

}));

TestRouter.post('/proxy2', asyncHandler(async (req: Request, res: Response) => {

  const responses = await Promise.allSettled([
    fetch(req.body.url, {
      method: 'GET',
      headers: {
        'user-agent': 'google-bot',
        origin: new URL(req.body.url).origin
      },
      redirect: 'follow'
    }),
    fetch(new URL(req.body.url).origin, {
      method: 'GET',
      headers: {
        'user-agent': 'google-bot',
        origin: new URL(req.body.url).origin
      },
      redirect: 'follow'
    })
  ]);

  if ( responses[0].status === 'rejected' )
    res.send('REJECTED');
  else if ( responses[1].status === 'rejected' )
    res.send('REJECTED');
  else {

    const preview1 = await getPreviewFromContent({
      data: await responses[0].value.text(),
      headers: {
        'content-type': responses[0].value.headers.get('content-type') || 'text/html; charset=utf-8'
      },
      url: req.body.url
    });

    const preview2 = await getPreviewFromContent({
      data: await responses[1].value.text(),
      headers: {
        'content-type': responses[1].value.headers.get('content-type') || 'text/html; charset=utf-8'
      },
      url: req.body.url
    });

    res.json([
      preview1,
      preview2
    ]);

  }

}));

TestRouter.post('/proxy3', asyncHandler(async (req: Request, res: Response) => {

  const responses = await Promise.allSettled([
    fetch(req.body.url, {
      method: 'GET',
      headers: {
        'user-agent': 'google-bot',
        origin: new URL(req.body.url).origin
      },
      redirect: 'follow'
    }),
    fetch(new URL(req.body.url).origin, {
      method: 'GET',
      headers: {
        'user-agent': 'google-bot',
        origin: new URL(req.body.url).origin
      },
      redirect: 'follow'
    })
  ]);

  if ( responses[0].status === 'rejected' )
    res.send('REJECTED');
  else if ( responses[1].status === 'rejected' )
    res.send('REJECTED');
  else {

    const previews = await Promise.all([
      getPreviewFromContent({
        data: await responses[0].value.text(),
        headers: {
          'content-type': responses[0].value.headers.get('content-type') || 'text/html; charset=utf-8'
        },
        url: req.body.url
      }),
      getPreviewFromContent({
        data: await responses[1].value.text(),
        headers: {
          'content-type': responses[1].value.headers.get('content-type') || 'text/html; charset=utf-8'
        },
        url: req.body.url
      })
    ]);

    res.json(previews);

  }

}));