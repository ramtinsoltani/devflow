import { NextFunction, Request, Response } from "express";

/**
 * Coverts a text search query string to Regex to be used in search.
 * @param q Text search query string
 * @returns QueryStringRegex object
 */
export function queryStringToRegex(q: string): QueryStringRegex {

  const tokens = q.replace(/\s+/g, ' ').trim().toLowerCase().split(' ');

  return {
    regex: tokens.map(t => `(${t})`).join('|'),
    flags: 'i'
  };

}

/**
 * Parses string array values (e.g. val1, val2, ...) in request query parameters to JS array.
 * @param paramName Query parameter name to parse to JS array
 * @returns Express middleware
 */
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