import {
  DynamoDBClient,
  GetItemCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from "@aws-sdk/client-dynamodb";
import { UnauthorizedException } from "../../utils/errors";

export const buildAddVoice =
  (
    ddb: DynamoDBClient,
    userTable: string,
    electionTable: string,
    electionUserTable: string,
  ) =>
  async (
    email: string,
    project: string,
    code: string,
    electionId: string,
    choiceId: string,
  ) => {
    const getItemCommand = new GetItemCommand({
      TableName: userTable,
      Key: {
        project: { S: project },
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
    const transactCommandInput: TransactWriteItemsCommandInput = {
      TransactItems: [
        {
          Update: {
            TableName: electionTable,
            Key: {
              electionId: { S: electionId },
              choiceId: { S: choiceId },
            },
            UpdateExpression: "ADD voteCount :incr",
            ExpressionAttributeValues: {
              ":incr": { N: "1" },
            },
          },
        },
        {
          Put: {
            TableName: electionUserTable,
            Item: {
              electionId: { S: electionId },
              email: { S: email },
              choiceId: { S: choiceId },
              timestamp: { N: String(Date.now()) },
            },
          },
        },
      ],
    };
    if (election) {
      transactCommandInput.TransactItems.push({
        Update: {
          TableName: electionTable,
          Key: {
            electionId: { S: electionId },
            choiceId: { S: election?.choiceId?.S },
          },
          UpdateExpression: "ADD voteCount :decr",
          ExpressionAttributeValues: {
            ":decr": { N: "-1" },
          },
        },
      });
    }
    const transactionCommand = new TransactWriteItemsCommand(
      transactCommandInput,
    );
    await ddb.send(transactionCommand);
  };
