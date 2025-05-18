import { APIGatewayProxyResult } from "aws-lambda";
import { UserFacingException } from "./errors";

type BuildLambdaResponseOptions = {
  body: unknown;
  statusCode: number;
  allowCORS?: boolean;
};

export const buildLambdaResponse = ({
  body,
  statusCode,
  allowCORS = false,
}: BuildLambdaResponseOptions): APIGatewayProxyResult => {
  const response: APIGatewayProxyResult = {
    statusCode,
    body: JSON.stringify(body),
    headers: {},
  };

  if (allowCORS) {
    response.headers = {
      "Access-Control-Allow-Origin": "*",
    };
  }

  return response;
};

type SuccessResponseBody = {
  message?: string;
  data?: unknown;
};

export const buildSuccessResponse = (
  config: SuccessResponseBody = { message: "Success" },
  statusCode = 200,
  allowCORS = true,
) => {
  const { message, data } = config;
  const response = buildLambdaResponse({
    body: { message, data },
    statusCode,
    allowCORS,
  });
  return response;
};

export const buildErrorResponse = (exception: unknown, allowCORS = true) => {
  let error = "Internal Server Error";
  let message;
  let details;
  let rawError;
  let statusCode = 500;
  if (exception instanceof UserFacingException) {
    if (exception.error) {
      error = exception.error;
    }
    message = exception.message;
    details = exception.details;
    rawError = exception.rawError;
    statusCode = exception.statusCode;
  } else {
    rawError = exception;
  }

  const response = buildLambdaResponse({
    body: { error, message, details },
    statusCode,
    allowCORS,
  });

  console.error(rawError);

  return response;
};

export const buildSuccessPublicResponse = (
  data?: unknown,
  statusCode = 200,
  allowCORS = true,
) =>
  buildLambdaResponse({
    body: data,
    statusCode,
    allowCORS,
  });
