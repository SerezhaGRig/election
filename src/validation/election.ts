import { z } from "zod";

export const addVoiceSchema = z
  .object({
    project: z.enum(["bloggers"]),
    email: z.string(),
    code: z.string(),
    choiceId: z.string(),
    electionId: z.string(),
  })
  .strict();
export type AddVoiceSchemaType = z.infer<typeof addVoiceSchema>;
export const getElectionSchema = z
  .object({
    electionId: z.string(),
  })
  .strict();
export type GetElectionSchemaType = z.infer<typeof getElectionSchema>;
