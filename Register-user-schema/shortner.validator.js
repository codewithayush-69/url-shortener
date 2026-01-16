import z from 'zod';

export const shortLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .url({ message: "Invalid URL format" })
    .max(1048, { message: "URL must be at most 1048 characters long" }),
  shortCode: z
    .string()
    .trim()
    .min(3, { message: "Shortcode must be at least 3 characters long" })
    .max(30, { message: "Shortcode must be at most 30 characters long" }),
});