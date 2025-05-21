import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { response } from "../../middleware/response";
import { validate } from "../../middleware/validate";
import {
  getChoiceSchema,
  GetChoiceSchemaType,
} from "../../validation/election";
import { buildGetChoice } from "../../services/election/getChoice";

const ddb = new DynamoDBClient({});

const { ELECTION_USER_TABLE, USER_AUTH_TABLE } = process.env;

export const logic = async (p: GetChoiceSchemaType) => {
  const result = await buildGetChoice(
    ddb,
    ELECTION_USER_TABLE,
    USER_AUTH_TABLE,
  )(p.email, p.project, p.code, p.electionId);
  return { data: result, statusCode: 200 };
};

export const handler = response(
  validate(logic, getChoiceSchema, "queryStringParameters"),
);
