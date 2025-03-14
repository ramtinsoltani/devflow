import { Request, Response, NextFunction } from 'express';
import { ServerError } from '../error';
import { AuthorizedRequest } from '../../models/requests';
import { asyncHandler } from './async-handler';

/**
 * Authentication middleware, making a given route protected.
 */
export const protectedRoute = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  const bearerToken = req.get('authorization')?.match(/^Bearer (?<token>.+)$/)?.groups?.token;

  if ( ! bearerToken )
    throw new ServerError('unauthorized', 'Missing bearer token!');

  try {

    (req as AuthorizedRequest).token = await services.auth.verifyToken(bearerToken);
    next();

  }
  catch (error) {

    throw new ServerError('unauthorized', 'Authentication failed!');

  }

});