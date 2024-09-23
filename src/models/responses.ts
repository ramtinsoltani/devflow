export interface IResponseGeneralMessage<T=any> {
  message: string,
  data?: T
}

export interface IResponseError {
  message: string,
  code: string
}