// eslint-disable-next-line max-classes-per-file
import { ZodError } from "zod";

export class Exception extends Error {}

export class MissingEnvException extends Exception {
  constructor(vars: string[]) {
    const errorMessage = `${vars.join(",")} missing as environment variables`;
    super(errorMessage);
  }
}

type UserFacingExceptionConstructorParams = {
  error: string;
  message?: string;
  statusCode?: number;
  details?: unknown[];
  rawError?: unknown;
};

export class UserFacingException extends Exception {
  constructor({
    error,
    message,
    statusCode,
    details,
    rawError,
  }: UserFacingExceptionConstructorParams) {
    super(message);
    this.error = error;
    this.statusCode = statusCode || 500;
    this.details = details;
    this.rawError = rawError;
  }

  public rawError?: unknown;

  public error?: string;

  public details?: unknown[];

  public statusCode: number;
}

export class UnauthorizedException extends UserFacingException {
  constructor(rawError?: unknown) {
    super({
      error: "Unauthorized",
      statusCode: 401,
      rawError,
    });
  }
}

export class ForbiddenException extends UserFacingException {
  constructor(message?: string, rawError?: unknown) {
    super({
      error: "Forbidden",
      message,
      statusCode: 403,
      rawError,
    });
  }
}

export class NotFoundException extends UserFacingException {
  constructor(message?: string, rawError?: unknown) {
    super({
      error: "Not Found",
      message,
      statusCode: 404,
      rawError,
    });
  }
}

export class ValidationException extends UserFacingException {
  constructor(message?: string, rawError?: unknown) {
    let validationErrorsParsed;
    if (rawError instanceof ZodError) {
      validationErrorsParsed = rawError.errors;
    }
    super({
      error: "Validation Error",
      message,
      statusCode: 400,
      details: validationErrorsParsed,
      rawError,
    });
  }
}

export class ConflictException extends UserFacingException {
  constructor(message?: string, rawError?: unknown) {
    super({
      error: "Conflict Error",
      message,
      statusCode: 409,
      rawError,
    });
  }
}
