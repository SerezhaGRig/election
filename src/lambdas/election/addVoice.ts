import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { response } from "../../middleware/response";
import { validate } from "../../middleware/validate";
import { buildAddVoice } from "../../services/election/addVoice";
import { addVoiceSchema, AddVoiceSchemaType } from "../../validation/election";

const ddb = new DynamoDBClient({});

const { USER_AUTH_TABLE, ELECTION_USER_TABLE, ELECTION_TABLE } = process.env;

export const logic = async (p: AddVoiceSchemaType) => {
  await buildAddVoice(
    ddb,
    USER_AUTH_TABLE,
    ELECTION_TABLE,
    ELECTION_USER_TABLE,
  )(p.email, p.project, p.code, p.electionId, p.choiceId);
  return { data: { message: "success" }, statusCode: 200 };
};

export const handler = response(validate(logic, addVoiceSchema, "body"));
