import { z, ZodType } from "zod";
import {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import { ValidationException } from "../utils/errors";

export const validateRequestBody = <T extends ZodType>(
  requestBody: string | null,
  validationSchema: T,
): z.infer<T> => {
  try {
    return validationSchema.parse(JSON.parse(requestBody as string));
  } catch (e) {
    throw new ValidationException("Invalid request body", e);
  }
};

export const validateQueryParams = <T extends ZodType>(
  queryParams: APIGatewayProxyEventQueryStringParameters | null,
  validationSchema: T,
): z.infer<T> => {
  try {
    return validationSchema.parse(queryParams);
  } catch (e) {
    throw new ValidationException("Invalid query params", e);
  }
};

export const validateParams = <T extends ZodType>(
  queryParams: { [index: string]: any } | null,
  validationSchema: T,
): z.infer<T> => {
  try {
    return validationSchema.parse(queryParams);
  } catch (e) {
    throw new ValidationException("Invalid multi-value query params", e);
  }
};

/**
 * Validates request path params by given schema
 *
 * @param pathParams - Path parameters type of {@link APIGatewayProxyEventPathParameters}
 * @param validationSchema - Validation schema
 * @returns value - Validated data object
 */
export const validatePathParams = <T extends ZodType>(
  pathParams: APIGatewayProxyEventPathParameters | null,
  validationSchema: T,
): z.infer<T> => {
  try {
    return validationSchema.parse(pathParams);
  } catch (e) {
    throw new ValidationException("Invalid path params", e);
  }
};

export const excludeMVQueryParams = <T extends readonly [string, ...string[]]>(
  params: T,
) =>
  z.object({
    exclude: z.array(z.enum(params)).optional(),
  });
