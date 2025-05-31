import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { genPinCode } from "../../utils/helpers";
import { UserFacingException } from "../../utils/errors";
import {
  Configuration,
  EmailsApi,
  EmailMessageData,
} from "@elasticemail/elasticemail-client-ts-axios";

const SENDER_EMAIL = "election@bloggersawards.com";
const config = new Configuration({
  apiKey: process.env.ELASTIC_EMAIL_KEY,
});

const emailsApi = new EmailsApi(config);

export const sendVerificationEmail = async (email: string, code: string) => {
  const emailMessageData: EmailMessageData = {
    Recipients: [
      {
        Email: email,
      },
    ],
    Content: {
      Body: [
        {
          ContentType: "PlainText",
          Charset: "utf-8",
          Content: `Your code is: ${code}`,
        },
      ],
      From: SENDER_EMAIL,
      Subject: "Your Auth Code",
    },
  };
  return emailsApi.emailsPost(emailMessageData);
};

export const buildSendAuthCode =
  (ddb: DynamoDBClient, table: string) =>
  async (email: string, project: string) => {
    const code = genPinCode(4);
    const getItemCommand = new GetItemCommand({
      TableName: table,
      Key: {
        project: { S: project },
        email: { S: email },
      },
    });
    const getResult = await ddb.send(getItemCommand);
    if (getResult.Item?.isVerified?.BOOL === true) {
      throw new UserFacingException({
        error: "RegisteredError",
        message: "Already Registered",
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
