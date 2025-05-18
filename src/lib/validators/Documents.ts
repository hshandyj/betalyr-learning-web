import { z } from "zod";

export const DocumentDeleteValidator = z.object({
  id: z.string(),
  currentDoc: z.string(),
});

export type DeleteDocumentPayload = z.infer<typeof DocumentDeleteValidator>;

export const DocumentUpdateValidator = z.object({
  id: z.string(),
  editorJson: z.any(),
});
