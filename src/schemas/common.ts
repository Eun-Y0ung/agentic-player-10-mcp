import { z } from "zod";

export const optionalText = z.string().trim().optional();

export const nonEmptyText = (message: string) =>
  z.string({ required_error: message, invalid_type_error: message }).trim().min(1, message);

export const EmploymentTypeSchema = z.enum(["intern", "newcomer", "entry", "any"]);
