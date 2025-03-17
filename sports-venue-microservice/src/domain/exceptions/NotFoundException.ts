export class NotFoundException extends Error {
  public readonly statusCode: number;

  constructor(message: string = "Not Found") {
    super(message);
    this.name = "NotFoundException";
    this.statusCode = 404;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
