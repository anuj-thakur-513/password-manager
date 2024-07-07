class ApiError extends Error {
  constructor(
    public message: string = "Something went Wrong",
    public errors: any[] = [],
    public stack?: string
  ) {
    super(message);
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
