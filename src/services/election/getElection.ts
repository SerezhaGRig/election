import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

export const buildGetElection =
  (ddb: DynamoDBClient, electionTable: string) =>
  async (electionId: string) => {
    const queryCommand = new QueryCommand({
      TableName: electionTable, // replace with your actual table name
      KeyConditionExpression: "electionId = :electionId",
      ExpressionAttributeValues: {
        ":electionId": { S: electionId },
      },
    });
    const queryResult = await ddb.send(queryCommand);
    const choices = queryResult.Items;
    const choiceCount: { [key: string]: number } = {};
    let electionCount = 0;
    choices.forEach((choice) => {
      const choiceId = choice?.choiceId?.S;
      const count = Number.parseInt(choice?.voteCount?.N);
      choiceCount[choiceId] = count;
      electionCount += count;
    });

    return {
      count: electionCount,
      choices: choiceCount,
    };
  };
