import type {
  Article as ArticleRow,
  Category as CategoryRow,
  Comment as CommentRow,
  NewsTip as NewsTipRow,
  NewsletterSubscriber as SubscriberRow,
  NewArticle,
} from "@/db/schema";

export const ARTICLE_STATUSES = ["draft", "review", "published", "archived"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  lga: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  imageUrl: string;
  isBreaking: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  shares: number;
  readTime: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type BreakingTicker = {
  id: string;
  text: string;
  link: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  description: string;
  visible: boolean;
  displayOrder: number;
};

export type Comment = {
  id: string;
  articleId: string | null;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  authorLocation: string | null;
  content: string;
  status: string;
  createdAt: string;
};

export type NewsTip = {
  id: number;
  headline: string;
  description: string;
  location: string;
  reporterContact: string | null;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
};

export type Subscriber = {
  id: string;
  email: string;
  fullName?: string | null;
  lga?: string | null;
  status?: string;
  createdAt: string;
};

export type ArticleInput = {
  title: string;
  summary: string;
  content: string;
  category: string;
  lga?: string;
  authorName?: string;
  authorRole?: string;
  imageUrl?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  readTime?: string;
  status?: string;
  views?: number;
  likes?: number;
  shares?: number;
};

const LGA_PREFIX = "LGA:";
const BREAKING_TAG = "Breaking";
const FALLBACK_LGA = "Delta State";
const DEFAULT_IMAGE = "/images/delta-updates-hero.jpg";

const PLACE_PATTERN =
  /\b(delta|warri|effurun|uvwie|asaba|oshi(mili)?|sapele|ughelli|agbor|abraka|ozoro|koko|oghara|kwale|patani|burutu|isoko|urhobo|itsekiri|ijaw|aniocha|ethiope|ndokwa|okpe|udenu|obiaruku|ogwashi-ukwu|aladja|ughele|omadino|ijaw)\b/i;

export function toArticleStatus(value: string | undefined | null): ArticleStatus {
  return ARTICLE_STATUSES.includes(value as ArticleStatus) ? (value as ArticleStatus) : "published";
}

function parseReadTime(value: string | undefined | null): number {
  const minutes = parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(minutes) || minutes < 1) return 3;
  return Math.min(minutes, 180);
}

function contentToBody(content: string): string[] {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs.slice(0, 200) : [content.trim()].filter(Boolean);
}

function buildTags(input: ArticleInput, baseTags: string[] = []): string[] {
  const tags: string[] = [];
  const lga = input.lga?.trim();
  if (lga) tags.push(`${LGA_PREFIX}${lga}`);
  if (input.isBreaking) tags.push(BREAKING_TAG);
  for (const tag of baseTags) {
    const value = tag.trim();
    if (!value || value.startsWith(LGA_PREFIX)) continue;
    if (value.toLowerCase() === BREAKING_TAG.toLowerCase()) continue;
    tags.push(value);
  }
  return Array.from(new Set(tags)).slice(0, 20);
}

function displayDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function toArticleView(row: ArticleRow): Article {
  const taggedLga = row.tags.find((tag) => tag.startsWith(LGA_PREFIX))?.slice(LGA_PREFIX.length);
  const placeLga = row.tags.find((tag) => PLACE_PATTERN.test(tag));
  const lga = (taggedLga || placeLga || FALLBACK_LGA).trim() || FALLBACK_LGA;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.dek,
    content: row.body.join("\n\n"),
    category: row.category,
    lga,
    tags: row.tags,
    authorName: row.author,
    authorRole: row.authorRole,
    imageUrl: row.image,
    isBreaking: row.tags.some((tag) => tag.toLowerCase() === BREAKING_TAG.toLowerCase()),
    isFeatured: row.featured,
    views: row.views,
    likes: row.likes,
    shares: row.shares,
    readTime: `${row.readTime} min read`,
    status: row.status,
    publishedAt: (row.publishedAtTs instanceof Date ? row.publishedAtTs : new Date()).toISOString(),
    createdAt: (row.createdAt instanceof Date ? row.createdAt : new Date()).toISOString(),
    updatedAt: (row.updatedAt instanceof Date ? row.updatedAt : new Date()).toISOString(),
  };
}

export function toArticleViews(rows: ArticleRow[]): Article[] {
  return rows.map(toArticleView);
}

export function articleInsertRow(input: ArticleInput, slug: string): NewArticle {
  const now = new Date();
  return {
    title: input.title,
    slug,
    dek: input.summary,
    body: contentToBody(input.content),
    category: input.category,
    tags: buildTags(input),
    author: input.authorName?.trim() || "Delta Updates Newsroom",
    authorRole: input.authorRole?.trim() || "Staff Reporter",
    publishedAt: displayDate(now),
    publishedAtTs: now,
    image: input.imageUrl?.trim() || DEFAULT_IMAGE,
    readTime: parseReadTime(input.readTime),
    featured: Boolean(input.isFeatured),
    status: toArticleStatus(input.status),
    views: input.views ?? 0,
    likes: input.likes ?? 0,
    shares: input.shares ?? 0,
  };
}

export function articleUpdateRow(input: ArticleInput, baseTags: string[] = []): Partial<NewArticle> {
  const row: Partial<NewArticle> = {};

  if (input.title !== undefined) row.title = input.title;
  if (input.summary !== undefined) row.dek = input.summary;
  if (input.content !== undefined) row.body = contentToBody(input.content);
  if (input.category !== undefined) row.category = input.category;
  if (input.authorName !== undefined) row.author = input.authorName.trim() || "Delta Updates Newsroom";
  if (input.authorRole !== undefined) row.authorRole = input.authorRole.trim() || "Staff Reporter";
  if (input.imageUrl !== undefined) row.image = input.imageUrl.trim() || DEFAULT_IMAGE;
  if (input.isFeatured !== undefined) row.featured = input.isFeatured;
  if (input.status !== undefined) row.status = toArticleStatus(input.status);
  if (input.readTime !== undefined) row.readTime = parseReadTime(input.readTime);
  if (input.views !== undefined) row.views = input.views;
  if (input.likes !== undefined) row.likes = input.likes;
  if (input.shares !== undefined) row.shares = input.shares;
  if (input.lga !== undefined || input.isBreaking !== undefined) {
    row.tags = buildTags(input, baseTags);
  }

  return row;
}

export function toCommentView(row: CommentRow): Comment {
  return {
    id: row.id,
    articleId: row.articleId,
    articleTitle: row.articleTitle,
    authorName: row.author,
    authorEmail: row.authorEmail,
    authorLocation: row.authorLocation,
    content: row.body,
    status: row.status,
    createdAt: (row.createdAt instanceof Date ? row.createdAt : new Date()).toISOString(),
  };
}

export function toCategoryView(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    emoji: row.emoji,
    color: row.color,
    description: row.description,
    visible: row.visible,
    displayOrder: row.ord,
  };
}

export function toSubscriberView(row: SubscriberRow): Subscriber {
  return {
    id: row.id,
    email: row.email,
    status: row.active ? "active" : "unsubscribed",
    createdAt: (row.subscribedAt instanceof Date ? row.subscribedAt : new Date()).toISOString(),
  };
}

export function toTipView(row: NewsTipRow): NewsTip {
  return {
    id: row.id,
    headline: row.headline,
    description: row.description,
    location: row.location,
    reporterContact: row.reporterContact,
    isAnonymous: row.isAnonymous,
    status: row.status,
    createdAt: (row.createdAt instanceof Date ? row.createdAt : new Date()).toISOString(),
  };
}

type StoredTicker = {
  id?: unknown;
  text?: unknown;
  title?: unknown;
  link?: unknown;
  priority?: unknown;
  isActive?: unknown;
  is_active?: unknown;
  createdAt?: unknown;
};

export function normalizeTickers(value: unknown): BreakingTicker[] {
  if (!Array.isArray(value)) return [];

  const tickers: BreakingTicker[] = [];
  value.forEach((entry, index) => {
    if (typeof entry === "string" && entry.trim()) {
      tickers.push({
        id: `ticker-${index}`,
        text: entry.trim(),
        link: null,
        priority: index + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    if (!entry || typeof entry !== "object") return;

    const raw = entry as StoredTicker;
    const text =
      (typeof raw.text === "string" && raw.text.trim()) ||
      (typeof raw.title === "string" && raw.title.trim()) ||
      "";
    if (!text) return;

    const priority = typeof raw.priority === "number" && raw.priority > 0 ? raw.priority : index + 1;
    const isActive =
      typeof raw.isActive === "boolean" ? raw.isActive : typeof raw.is_active === "boolean" ? raw.is_active : true;

    tickers.push({
      id: typeof raw.id === "string" && raw.id ? raw.id : `ticker-${index}`,
      text,
      link: typeof raw.link === "string" && raw.link ? raw.link : null,
      priority,
      isActive,
      createdAt: typeof raw.createdAt === "string" && raw.createdAt ? raw.createdAt : new Date().toISOString(),
    });
  });

  return tickers;
}

export function sortTickers(tickers: BreakingTicker[]): BreakingTicker[] {
  return [...tickers].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
