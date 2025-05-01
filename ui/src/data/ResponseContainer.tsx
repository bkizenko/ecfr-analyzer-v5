export interface ResponseContainer<T> {
  data?: T;
  err?: ErrorResponse;
}

export interface ErrorResponse {
  code: number;
  message: string;
}

export function successResponse<T>(data: T): ResponseContainer<T> {
  return { data };
}

export function errorResponse<T>(err: ErrorResponse): ResponseContainer<T> {
  return { err };
}
