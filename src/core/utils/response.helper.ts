import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  meta: Record<string, any>;
  error: any | null;
}

export const sendSuccess = (
  res: Response,
  data: any,
  meta: Record<string, any> = {},
  statusCode: number = 200
) => {
  const response: ApiResponse = {
    success: true,
    data,
    meta,
    error: null,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error: any = null
) => {
  const response: ApiResponse = {
    success: false,
    data: null,
    meta: {},
    error: {
      message,
      details: error,
    },
  };
  return res.status(statusCode).json(response);
};
