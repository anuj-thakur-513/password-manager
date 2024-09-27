interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  value?: string;
  message: string;
  errors?: any[];
  stack?: string;
}

export default CustomError;
