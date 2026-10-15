import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const articleCreateSchema = z.object({
  title: z.string().trim().min(3).max(240),
  summary: z.string().trim().min(3).max(600),
  content: z.string().trim().min(10).max(50_000),
  category: z.string().trim().min(1).max(40),
  lga: z.string().trim().max(80).optional(),
  authorName: z.string().trim().max(120).optional(),
  authorRole: z.string().trim().max(120).optional(),
  imageUrl: z.string().trim().max(600).optional(),
  isBreaking: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  readTime: z.string().trim().max(40).optional(),
  status: z.enum(["draft", "review", "published", "archived"]).optional(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const breakingSchema = z.object({
  text: z.string().trim().min(3).max(200),
  link: z.string().trim().max(600).optional().nullable(),
  priority: z.coerce.number().int().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a hex value like #0b2545")
    .optional(),
});

export const commentSchema = z.object({
  articleId: z.uuid({ message: "Invalid article id" }),
  articleTitle: z.string().trim().max(240).optional(),
  authorName: z.string().trim().min(1).max(80),
  authorEmail: z.string().trim().regex(emailPattern, "Enter a valid email address").max(200),
  authorLocation: z.string().trim().max(80).optional(),
  content: z.string().trim().min(1).max(2000),
});

export const tipSchema = z.object({
  headline: z.string().trim().min(3).max(200),
  description: z.string().trim().min(3).max(5000),
  location: z.string().trim().min(2).max(120),
  reporterContact: z.string().trim().max(200).optional().nullable(),
  isAnonymous: z.boolean().optional(),
});

export const subscriberSchema = z.object({
  email: z.string().trim().regex(emailPattern, "Enter a valid email address").max(200),
  fullName: z.string().trim().max(120).optional().nullable(),
  lga: z.string().trim().max(80).optional(),
});

export const pollSchema = z.object({
  optionSelected: z.string().trim().min(1).max(200),
});

export const reactSchema = z.object({
  type: z.enum(["like", "share"]),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request payload";
}
