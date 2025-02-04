export class ForbiddenException extends Error {
  public readonly statusCode: number;

  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ForbiddenException";
    this.statusCode = 403;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
