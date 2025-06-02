import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { genPinCode } from "../../utils/helpers";
import { UserFacingException } from "../../utils/errors";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const SENDER_EMAIL = "election@bloggersawards.com";

export const sendVerificationEmail = async (email: string, code: string) => {
  const client = new SESClient({ region: "us-east-1" });

  const command = new SendEmailCommand({
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: { Data: "Your Auth Code" },
      Body: {
        Text: { Data: `Your code is: ${code}` },
      },
    },
  });
  return client.send(command);
};

export const buildSendAuthCode =
  (ddb: DynamoDBClient, table: string) =>
  async (email: string, project: string, type?: "registration" | "restore") => {
    const code = genPinCode(4);
    const getItemCommand = new GetItemCommand({
      TableName: table,
      Key: {
        project: { S: project },
        email: { S: email },
      },
    });
    const getResult = await ddb.send(getItemCommand);
    if (getResult.Item?.isVerified?.BOOL === true && type !== "restore") {
      throw new UserFacingException({
        error: "RegisteredError",
        message: "Already Registered",
        statusCode: 409,
      });
    }
    if (type === "restore" && getResult.Item?.isVerified?.BOOL === false) {
      throw new UserFacingException({
        error: "RegisteredError",
        message: "Code is already sent",
        statusCode: 409,
      });
    }
    const putItemCommand = new PutItemCommand({
      TableName: table,
      Item: {
        project: { S: project },
        email: { S: email },
        code: { S: code },
        isVerified: { BOOL: false },
      },
    });
    await ddb.send(putItemCommand);
    await sendVerificationEmail(email, code);
  };
