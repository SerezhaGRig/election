import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { genPinCode } from "../../utils/helpers";
import { UserFacingException } from "../../utils/errors";

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendVerificationEmail = async (email: string, code: string) => {
  const html = `
    <h2>Hello!</h2>
    <p>Your verification code is:</p>
    <h3 style="color: blue;">${code}</h3>
    <p>This code will expire in 10 minutes.</p>
  `;

  const msg = {
    to: email,
    from: "no-reply@yourdomain.com", // Use a verified sender
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}. It expires in 10 minutes.`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Verification email sent to", email);
  } catch (err) {
    console.error(
      "Failed to send verification email:",
      err.response?.body || err.message,
    );
    throw err;
  }
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
