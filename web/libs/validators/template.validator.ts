import { z } from "zod";

const sendOnDayRegex = /^(-?([1-2]?[0-9]|30)|0)$/;
const sendOnHourFixedRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const sendOnHourRelativeRegex = /^-?([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const optionalUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal(""));

export const templateMessageSchema = z.object({
  phoneId: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid phone ID"),

  sendTimeType: z
    .enum(["fixed_time", "event_time", "relative_time"])
    .optional()
    .default("fixed_time"),

  sendOnDay: z
    .string()
    .regex(sendOnDayRegex, "Invalid day format. Must be between -30 and +30, or 0 for D-Day")
    .refine((val) => {
      const num = parseInt(val);
      return num >= -30 && num <= 30;
    }, "Day must be between -30 and +30"),

  sendOnHour: z.string(),

  messageTemplate: z
    .string()
    .min(1, "Message is required")
    .max(4096, "Message is too long"),

  image: optionalUrlSchema,
  video: optionalUrlSchema,
}).superRefine((data, ctx) => {
  if (data.sendTimeType === "relative_time") {
    if (!sendOnHourRelativeRegex.test(data.sendOnHour)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid time format. Must be HH:mm or -HH:mm",
        path: ["sendOnHour"],
      });
    }
  } else {
    if (!sendOnHourFixedRegex.test(data.sendOnHour)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid time format. Must be HH:mm",
        path: ["sendOnHour"],
      });
    }
  }
});

export const templateCreateSchema = z.object({
  titre: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long"),

  messages: z
    .array(templateMessageSchema)
    .min(1, "At least one message is required")
    .max(50, "Too many messages (max 50)"),
});

export const templateUpdateSchema = templateCreateSchema.partial();

export type TemplateMessageInput = z.infer<typeof templateMessageSchema>;
export type TemplateCreateInput = z.infer<typeof templateCreateSchema>;
export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>;
