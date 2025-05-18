import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  authSendCodeSchema,
  AuthSendCodeSchemaType,
} from "../../validation/authentication";
import { response } from "../../middleware/response";
import { validate } from "../../middleware/validate";
import { buildSendAuthCode } from "../../services/authentication/sendCode";

const ddb = new DynamoDBClient({});

const { USER_AUTH_TABLE } = process.env;

export const logic = async (p: AuthSendCodeSchemaType) => {
  await buildSendAuthCode(ddb, USER_AUTH_TABLE)(p.email, p.project);
  return { data: { message: "success" }, statusCode: 200 };
};

export const handler = response(validate(logic, authSendCodeSchema, "body"));
