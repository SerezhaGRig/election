import { APIGatewayProxyWithCognitoAuthorizerEvent } from "aws-lambda";
import { buildErrorResponse, buildSuccessResponse } from "../utils/response";
export type HandlerResponse = {
  statusCode: number;
  data?: unknown;
  message?: string;
};

export type AuthHandler = (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
) => Promise<HandlerResponse>;

export type Handler = (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
) => Promise<HandlerResponse>;

export const response =
  (handler: AuthHandler) =>
  async (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    try {
      const { statusCode, ...body } = await handler(event);
      return buildSuccessResponse(body, statusCode);
    } catch (e) {
      console.error(e);
      return buildErrorResponse(e);
    }
  };
