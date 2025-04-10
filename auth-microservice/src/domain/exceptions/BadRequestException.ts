export class BadRequestException extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string = 'Bad Request', details?: any) {
    super(message);
    this.name = 'BadRequestException';
    this.statusCode = 400;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
