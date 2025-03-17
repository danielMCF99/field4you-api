export class ConflictException extends Error {
  public readonly statusCode: number;
  constructor(message: string = "Conflict") {
    super(message);
    this.name = "ConflictException";
    this.statusCode = 409;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
