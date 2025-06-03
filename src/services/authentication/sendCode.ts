import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { genPinCode } from "../../utils/helpers";
import { UserFacingException } from "../../utils/errors";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.EMAIL_KEY!);

const SENDER_EMAIL = "election@bloggersawards.com";

export const sendVerificationEmail = async (email: string, code: string) => {
  const msg = {
    to: email,
    from: SENDER_EMAIL,
    subject: "Your Auth Code",
    text: `Your code is: ${code}`,
  };

  await sgMail.send(msg);
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
