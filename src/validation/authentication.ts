import { z } from "zod";

export const authSendCodeSchema = z
  .object({
    project: z.enum(["bloggers"]),
    email: z.string(),
  })
  .strict();
export type AuthSendCodeSchemaType = z.infer<typeof authSendCodeSchema>;
export const authValidateCodeSchema = z
  .object({
    project: z.enum(["bloggers"]),
    email: z.string(),
    code: z.string(),
    type: z.enum(["registration", "restore"]).optional(),
  })
  .strict();
export type AuthValidateCodeSchemaType = z.infer<typeof authValidateCodeSchema>;
