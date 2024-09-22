export class DefaultErrorHandler extends Error {
  public code: number;
  public context?: string;

  constructor(message: string, code: number, context?: string) {
    super(message);
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}
