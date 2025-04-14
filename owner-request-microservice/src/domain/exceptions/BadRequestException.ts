export class BadRequestException extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'Bad Request') {
    super(message);
    this.name = 'BadRequestException';
    this.statusCode = 400;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
