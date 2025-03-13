import { Request, Response, Router } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";

export const TestRouter = Router();

TestRouter.post('/proxy', asyncHandler(async (req: Request, res: Response) => {

  fetch(req.body.url, {
    method: 'GET',
    headers: {
      'user-agent': 'google-bot',
      origin: new URL(req.body.url).origin
    },
    redirect: 'follow'
  })
  .then(response => {

    return response.text();

  })
  .then(text => res.send(text))
  .catch(error => {

    res.json(error);

  });

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

    const text1 = await responses[0].value.text();
    const text2 = await responses[1].value.text();

    res.send(text1 + text2);

  }

}));