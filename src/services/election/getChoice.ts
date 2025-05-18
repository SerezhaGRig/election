import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { UnauthorizedException } from "../../utils/errors";

export const buildGetChoice =
  (ddb: DynamoDBClient, electionUserTable: string) =>
  async (email: string, project: string, code: string, electionId: string) => {
    const getItemCommand = new GetItemCommand({
      TableName: electionUserTable,
      Key: {
        electionId: { S: project },
        email: { S: email },
      },
    });
    const getResult = await ddb.send(getItemCommand);
    if (
      getResult.Item?.isVerified?.BOOL !== true ||
      code !== getResult.Item?.code?.S
    ) {
      throw new UnauthorizedException();
    }
    const getElectionCommand = new GetItemCommand({
      TableName: electionUserTable,
      Key: {
        electionId: { S: electionId },
        email: { S: email },
      },
    });
    const { Item: election } = await ddb.send(getElectionCommand);
    return (
      election && {
        email: election?.email?.S,
        choiceId: election?.choiceId?.S,
        electionId: election?.electionId?.S,
        timestamp: election?.timestamp?.N,
      }
    );
  };
