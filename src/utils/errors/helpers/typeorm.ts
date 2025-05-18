import { QueryFailedError } from "typeorm";
import {
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from "@drdgvhbh/postgres-error-codes";

export type DriverError = {
  detail?: string;
  code?: string;
  name: string;
  message: string;
  table?: string;
};
type UniqueViolationError = QueryFailedError<DriverError> & {
  driverError: {
    code: typeof PG_UNIQUE_VIOLATION;
  };
};

type ForeignKeyViolationError = QueryFailedError<DriverError> & {
  driverError: {
    code: typeof PG_FOREIGN_KEY_VIOLATION;
  };
};
const isQueryFailedError = (e: unknown): e is QueryFailedError<DriverError> =>
  e instanceof QueryFailedError;

export type IsUniqueViolationError = (e: unknown) => e is UniqueViolationError;
export const isUniqueViolationError: IsUniqueViolationError = (
  e: unknown,
): e is UniqueViolationError =>
  isQueryFailedError(e) && e.driverError?.code === PG_UNIQUE_VIOLATION;

export type IsForeignKeyViolationError = (
  e: unknown,
) => e is ForeignKeyViolationError;
export const isForeignKeyViolationError: IsForeignKeyViolationError = (
  e: unknown,
): e is ForeignKeyViolationError =>
  isQueryFailedError(e) && e.driverError?.code === PG_FOREIGN_KEY_VIOLATION;

export type ExtractMessageFromQueryFailedError = (
  e: QueryFailedError,
) => string | undefined;
export const extractMessageFromQueryFailedError = (
  e: QueryFailedError<DriverError>,
): string | undefined => {
  const table = e.driverError?.table;
  const detail = e.driverError?.detail;
  if (table && detail) {
    return `On table "${table}": ${detail}`;
  }
  return undefined;
};
