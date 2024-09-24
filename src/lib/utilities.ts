import { NextFunction, Request, Response } from "express";

export function queryStringToRegex(q: string): QueryStringRegex {

  const tokens = q.replace(/\s+/g, ' ').trim().toLowerCase().split(' ');

  return {
    regex: tokens.map(t => `(${t})`).join('|'),
    flags: 'i'
  };

}

export function queryArrayParserMiddleware(paramName: string): (req: Request, res: Response, next: NextFunction) => void {

  return (req: Request, res: Response, next: NextFunction) => {

    const array = req.query[paramName] as string | undefined;

    if ( ! array ) {

      req.query[paramName] = [];

    }
    else {

      req.query[paramName] = array
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length);
      
    }

    next();

  };

}

export interface QueryStringRegex {
  regex: string,
  flags: string
}