import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { UnauthorizedException } from "../../utils/errors";

export const buildValidateAuthCode =
  (ddb: DynamoDBClient, table: string) =>
  async (email: string, project: string, code: string) => {
    const getItemCommand = new GetItemCommand({
      TableName: table,
      Key: {
        project: { S: project },
        email: { S: email },
      },
    });
    const getResult = await ddb.send(getItemCommand);
    if (getResult.Item?.code?.S === code) {
      throw new UnauthorizedException();
    }
    const putItemCommand = new PutItemCommand({
      TableName: table,
      Item: {
        project: { S: project },
        email: { S: email },
        code: { S: code },
        isVerified: { BOOL: true },
      },
    });
    await ddb.send(putItemCommand);
  };
