import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { response } from "../../middleware/response";
import { validate } from "../../middleware/validate";
import {
  getElectionSchema,
  GetElectionSchemaType,
} from "../../validation/election";
import { buildGetElection } from "../../services/election/getElection";

const ddb = new DynamoDBClient({});

const { ELECTION_TABLE } = process.env;

export const logic = async (p: GetElectionSchemaType) => {
  const result = await buildGetElection(ddb, ELECTION_TABLE)(p.electionId);
  return { data: result, statusCode: 200 };
};

export const handler = response(
  validate(logic, getElectionSchema, "queryStringParameters"),
);
