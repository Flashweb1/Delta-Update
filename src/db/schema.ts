import { pgEnum, pgTable, serial, text, timestamp, boolean, integer, uuid, jsonb } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", ["admin", "editor"]);

export const articleStatusEnum = pgEnum("article_status", ["draft", "review", "published", "archived"]);

export const commentStatusEnum = pgEnum("comment_status", ["pending", "approved", "rejected"]);

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  dek: text("dek").notNull(),
  body: text("body").array().notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  author: text("author").notNull(),
  authorRole: text("author_role").notNull(),
  publishedAt: text("published_at").notNull(),
  publishedAtTs: timestamp("published_at_ts", { withTimezone: true }).notNull().defaultNow(),
  image: text("image").notNull(),
  slug: text("slug").notNull().unique(),
  readTime: integer("read_time").notNull(),
  featured: boolean("featured").notNull().default(false),
  status: articleStatusEnum("status").notNull().default("published"),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  emoji: text("emoji").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
  visible: boolean("visible").notNull().default(true),
  ord: integer("ord").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id"),
  articleTitle: text("article_title").notNull(),
  author: text("author").notNull(),
  authorEmail: text("author_email").notNull(),
  authorLocation: text("author_location"),
  body: text("body").notNull(),
  status: commentStatusEnum("status").notNull().default("pending"),
  aiVerdict: jsonb("ai_verdict"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  active: boolean("active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  uid: text("uid").primaryKey(),
  role: adminRoleEnum("role").notNull().default("editor"),
  approvedAt: timestamp("approved_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pendingUsers = pgTable("pending_users", {
  uid: text("uid").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteConfig = pgTable("site_config", {
  id: integer("id").primaryKey(),
  siteName: text("site_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  contactEmail: text("contact_email").notNull(),
  facebook: text("facebook").notNull(),
  twitter: text("twitter").notNull(),
  instagram: text("instagram").notNull(),
  youtube: text("youtube").notNull(),
  defaultCategory: text("default_category").notNull(),
  breakingNews: jsonb("breaking_news").notNull(),
  homepageSections: jsonb("homepage_sections").notNull(),
  featuredArticleId: text("featured_article_id"),
  metaDescription: text("meta_description").notNull(),
  ogImageUrl: text("og_image_url").notNull(),
  twitterCardType: text("twitter_card_type").notNull(),
  canonicalDomain: text("canonical_domain").notNull(),
  audioEnabled: boolean("audio_enabled").notNull(),
  dropCaps: boolean("drop_caps").notNull(),
  defaultFontSize: text("default_font_size").notNull(),
  defaultFontStyle: text("default_font_style").notNull(),
  newsletterUrl: text("newsletter_url").notNull(),
  articlesPerSection: integer("articles_per_section").notNull(),
  showEditorsPick: boolean("show_editors_pick").notNull(),
  showNewsletter: boolean("show_newsletter").notNull(),
  showOpinion: boolean("show_opinion").notNull(),
  showTopStories: boolean("show_top_stories").notNull(),
  requireCommentModeration: boolean("require_comment_moderation").notNull(),
  notifyOnComment: boolean("notify_on_comment").notNull(),
  notifyOnPublish: boolean("notify_on_publish").notNull(),
  adminEmails: text("admin_emails").array().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsTips = pgTable("news_tips", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  reporterContact: text("reporter_contact"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pollQuestion: text("poll_question").notNull(),
  optionSelected: text("option_selected").notNull(),
  voterIpHash: text("voter_ip_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewsTip = typeof newsTips.$inferSelect;
export type PollVote = typeof pollVotes.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type PendingUser = typeof pendingUsers.$inferSelect;
export type SiteConfig = typeof siteConfig.$inferSelect;
