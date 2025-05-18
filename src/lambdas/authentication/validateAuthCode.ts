import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  authValidateCodeSchema,
  AuthValidateCodeSchemaType,
} from "../../validation/authentication";
import { response } from "../../middleware/response";
import { validate } from "../../middleware/validate";
import { buildValidateAuthCode } from "../../services/authentication/validateAuthCode";

const ddb = new DynamoDBClient({});

const { USER_AUTH_TABLE } = process.env;

export const logic = async (p: AuthValidateCodeSchemaType) => {
  await buildValidateAuthCode(ddb, USER_AUTH_TABLE)(p.email, p.project, p.code);
  return { data: { message: "success" }, statusCode: 200 };
};

export const handler = response(
  validate(logic, authValidateCodeSchema, "body"),
);
