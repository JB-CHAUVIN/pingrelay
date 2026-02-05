import { z } from "zod";

/**
 * Regex for international phone number format
 * Must start with + followed by 1-9, then 9-14 digits
 * Examples: +33612345678, +14155552671, +861234567890
 */
const internationalPhoneRegex = /^\+[1-9]\d{9,14}$/;

export const phoneCreateSchema = z.object({
  phone: z
    .string()
    .min(10, "Le numéro doit contenir au moins 10 caractères")
    .max(20, "Le numéro ne peut pas dépasser 20 caractères")
    .transform((val) => val.replace(/[\s\-\(\)]/g, "")) // Normalize: remove spaces, dashes, parentheses
    .pipe(
      z.string().regex(
        internationalPhoneRegex,
        "Format invalide. Utilisez le format international (ex: +33612345678)"
      )
    ),
  status: z.enum(["connected", "disconnected"]).optional(),
});

export const phoneUpdateSchema = phoneCreateSchema.partial();

export type PhoneCreateInput = z.infer<typeof phoneCreateSchema>;
export type PhoneUpdateInput = z.infer<typeof phoneUpdateSchema>;
