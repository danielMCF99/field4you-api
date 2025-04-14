export class UnauthorizedException extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
    this.statusCode = 401;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
