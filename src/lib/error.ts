export class ServerError extends Error {

  public statusCode!: number;

  constructor(
    public code: string,
    public message: string
  ) {

    super(message);

    this.statusCode = errorCodeToStatusCode[this.code] || 500;

  }

  public static from(error: any): ServerError {

    if ( error instanceof ServerError )
      return error;

    if ( ! error.code && error.name === 'ValidationError' )
      return new ServerError('validation', error.message);

    return new ServerError(error.code || 'unknown', error.message);

  }

}

const errorCodeToStatusCode: any = {
  'invalid-request': 400,
  validation: 400,
  unknown: 500
};