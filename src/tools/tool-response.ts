import type { z } from "zod";

export type TextContentResponse = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};

export function textResponse(text: string): TextContentResponse {
  return {
    content: [
      {
        type: "text",
        text
      }
    ]
  };
}

export function validationMessage(error: z.ZodError, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}
