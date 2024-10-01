export class ServerError extends Error {

  public statusCode!: number;

  /**
   * @param code Error code
   * @param message Error message
   */
  constructor(
    public code: string,
    public message: string
  ) {

    super(message);

    this.statusCode = errorCodeToStatusCode[this.code] || 500;

  }

  /**
   * Creates a new instance of ServerError from any error objects.
   * @param error An error object
   * @returns ServerError instance
   */
  public static from(error: any): ServerError {

    if ( error instanceof ServerError )
      return error;

    if ( ! error.code && error.name === 'ValidationError' )
      return new ServerError('validation', error.message);

    return new ServerError(error.code || 'unknown', error.message);

  }

}

/** Internal error code to HTTP status code mappings */
const errorCodeToStatusCode: any = {
  'invalid-request': 400,
  validation: 400,
  'not-found': 404,
  'internal': 500,
  unknown: 500
};