import { z } from "zod";

export const variableEntrySchema = z.object({
  key: z
    .string()
    .min(1, "Variable key is required")
    .max(100, "Key is too long")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Key must be a valid variable name"),

  value: z
    .string()
    .min(1, "Variable value is required")
    .max(1000, "Value is too long"),
});

export const scheduleCreateSchema = z.object({
  groupName: z
    .string()
    .min(1, "Group name is required")
    .max(200, "Group name is too long"),

  messageTemplateId: z
    .string()
    .min(1, "Template is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid template ID"),

  eventDate: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, "Event date must be in the future"),

  variables: z
    .array(variableEntrySchema)
    .optional()
    .default([]),
});

export const scheduleUpdateSchema = scheduleCreateSchema
  .partial()
  .extend({
    status: z.enum(["pending", "running", "completed", "failed"]).optional(),
  });

export type VariableEntryInput = z.infer<typeof variableEntrySchema>;
export type ScheduleCreateInput = z.infer<typeof scheduleCreateSchema>;
export type ScheduleUpdateInput = z.infer<typeof scheduleUpdateSchema>;
