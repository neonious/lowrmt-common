export class DefinedError extends Error {
  constructor(public readonly stage: string, public readonly inner: unknown) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
