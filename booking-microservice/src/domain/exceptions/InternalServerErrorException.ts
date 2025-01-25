export class InternalServerErrorException extends Error {
  public readonly statusCode: number;

  constructor(message: string = "Internal Server Error") {
    super(message);
    this.name = "InternalServerErrorException";
    this.statusCode = 500;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
