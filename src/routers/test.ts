import { Request, Response, Router } from "express";
import { asyncHandler } from "../lib/middleware/async-handler";

export const TestRouter = Router();

TestRouter.post('/proxy', asyncHandler(async (req: Request, res: Response) => {

  fetch(req.body.url, {
    method: 'GET',
    headers: {
      'user-agent': 'google-bot',
      origin: new URL(req.body.url).origin
    }
  })
  .then(response => {

    return response.text();

  })
  .then(text => res.send(text))
  .catch(error => {

    res.json(error);

  });

}));