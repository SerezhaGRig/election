import { APIGatewayProxyWithCognitoAuthorizerEvent } from "aws-lambda";
import { z } from "zod";
import {
  validatePathParams,
  validateQueryParams,
  validateRequestBody,
} from "../validation";
import { HandlerResponse } from "./response";

export type ValidateHandler = (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
) => unknown;

export type PathString = "queryStringParameters" | "pathParameters" | "body";

export const validate =
  <T>(
    handler: (validParams: T) => Promise<HandlerResponse>,
    schemaOrFunction: ValidateHandler | z.ZodType,
    path?: PathString,
    checkIf = false,
    defaultValue?: unknown,
  ) =>
  (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    let validParams;

    if (typeof schemaOrFunction === "function") {
      return handler(<T>schemaOrFunction(event));
    }

    switch (path) {
      case "queryStringParameters": {
        if (checkIf) {
          if (event[path]) {
            validParams = validateQueryParams(event[path], schemaOrFunction);
            break;
          }
          validParams = defaultValue;
          break;
        }
        validParams = validateQueryParams(event[path], schemaOrFunction);
        break;
      }
      case "pathParameters": {
        if (checkIf) {
          if (event[path]) {
            validParams = validatePathParams(event[path], schemaOrFunction);
            break;
          }
          validParams = defaultValue;
          break;
        }
        validParams = validatePathParams(event[path], schemaOrFunction);
        break;
      }
      case "body": {
        if (checkIf) {
          if (event[path]) {
            validParams = validateRequestBody(event[path], schemaOrFunction);
            break;
          }
          validParams = defaultValue;
          break;
        }
        validParams = validateRequestBody(event[path], schemaOrFunction);
        break;
      }
      default: {
        validParams = defaultValue;
        break;
      }
    }

    return handler(validParams);
  };
