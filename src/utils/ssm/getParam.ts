import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient();

export const getSSMParam = async (name: string) => {
  const res = await client.send(
    new GetParameterCommand({
      Name: name,
      WithDecryption: false,
    }),
  );
  return res.Parameter.Value;
};
