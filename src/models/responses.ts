export interface IResponseGeneralMessage<T=any> {
  message: string,
  data?: T
}

export interface IResponseError {
  message: string,
  code: string
}

export interface IResponseUrlMetadata {
  title?: string,
  description?: string,
  posterUrl?: string,
  originTitle?: string,
  originUrl?: string,
  favicon?: string
}