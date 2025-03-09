import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async middleware with an error handler.
 * @param middleware An async middleware
 * @returns Express middleware
 */
export function asyncHandler(middleware: Function) {

  return (req: Request, res: Response, next: NextFunction) => {

    middleware(req, res, next).catch(next);

  };

}