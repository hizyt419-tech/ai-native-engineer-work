import { NEWS_SOURCES, DAILY_TOPICS, type NewsSource } from "../../news-sources";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  sourceId: string;
  category: "social" | "industry";
  time: string;
  summary: string;
}

interface RawEntry {
  title: string;
  url: string;
  summary: string;
  time: string;
}

const FETCH_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ITEMS_PER_SOURCE = 30;
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 过滤 3 天前的旧闻，防止停更源污染列表
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

let cache: {
  at: number;
  items: NewsItem[];
  failed: { id: string; reason: string }[];
} | null = null;

// ======================== 文本处理 ========================

function stripTags(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
}

// ======================== RSS / ATOM 解析（零依赖） ========================

function extractTag(block: string, tag: string, attr?: string): string {
  if (attr) {
    const re = new RegExp(`<${tag}\\b[^>]*\\b${attr}=["']([^"']+)["']`, "i");
    const m = block.match(re);
    if (m) return m[1].trim();
  }
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function parseRSS(xml: string): RawEntry[] {
  const out: RawEntry[] = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml))) {
    const block = m[0];
    const title = decodeEntities(stripTags(extractTag(block, "title")));
    const url = decodeEntities(extractTag(block, "link") || extractTag(block, "guid"));
    const time = extractTag(block, "pubDate") || extractTag(block, "dc:date");
    const summary = decodeEntities(stripTags(extractTag(block, "description"))).slice(0, 160);
    if (title && url) out.push({ title, url, summary, time });
  }
  return out;
}

function parseAtom(xml: string): RawEntry[] {
  const out: RawEntry[] = [];
  const entryRe = /<entry\b[\s\S]*?<\/entry>/gi;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml))) {
    const block = m[0];
    const title = decodeEntities(stripTags(extractTag(block, "title")));
    const url = decodeEntities(extractTag(block, "link", "href"));
    const time = extractTag(block, "published") || extractTag(block, "updated");
    const summary = decodeEntities(
      stripTags(extractTag(block, "summary") || extractTag(block, "content"))
    ).slice(0, 160);
    if (title && url) out.push({ title, url, summary, time });
  }
  return out;
}

function parseTime(raw: string): number {
  if (!raw) return 0;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
}

// ======================== 抓取 ========================

async function fetchSource(src: NewsSource): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(src.url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (!xml || xml.length < 200) throw new Error("空响应");
    const raw = src.type === "atom" ? parseAtom(xml) : parseRSS(xml);
    if (raw.length === 0) throw new Error("解析不到条目");
    const now = Date.now();
    return raw.slice(0, MAX_ITEMS_PER_SOURCE).map((r) => ({
      title: r.title || "（无标题）",
      url: r.url,
      summary: r.summary || "",
      source: src.name,
      sourceId: src.id,
      category: src.category,
      time: new Date(parseTime(r.time) || now).toISOString(),
    }));
  } finally {
    clearTimeout(timer);
  }
}

async function loadAll(): Promise<{
  items: NewsItem[];
  failed: { id: string; reason: string }[];
}> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache;

  const results = await Promise.allSettled(NEWS_SOURCES.map((s) => fetchSource(s)));
  const items: NewsItem[] = [];
  const failed: { id: string; reason: string }[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      items.push(...r.value);
    } else {
      failed.push({ id: NEWS_SOURCES[i].id, reason: String(r.reason || "").slice(0, 120) });
    }
  });

  // 按标题去重
  const seen = new Set<string>();
  const deduped: NewsItem[] = [];
  for (const it of items) {
    const key = it.title.replace(/\s+/g, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(it);
  }
  deduped.sort((a, b) => (a.time < b.time ? 1 : -1));

  const nowMs = Date.now();
  const fresh = deduped.filter((it) => {
    const t = new Date(it.time).getTime();
    return Number.isNaN(t) || t >= nowMs - MAX_AGE_MS;
  });
  // 全部过期时兜底展示最新条目，避免空列表
  cache = { at: nowMs, items: fresh.length > 0 ? fresh : deduped.slice(0, 50), failed };
  return cache;
}

// ======================== 每日精选 ========================

function isSameDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function pickDaily(items: NewsItem[]): NewsItem[] {
  const now = new Date();
  const topic = DAILY_TOPICS[now.getDay()] ?? DAILY_TOPICS[1];
  const todayItems = items.filter((i) => isSameDay(i.time, now));
  const matched = todayItems.filter((i) =>
    topic.keywords.some((k) => (i.title + " " + i.summary).includes(k))
  );
  const pool = [...matched, ...todayItems, ...items];
  const seen = new Set<string>();
  const picks: NewsItem[] = [];
  for (const it of pool) {
    if (seen.has(it.title)) continue;
    seen.add(it.title);
    picks.push(it);
    if (picks.length >= 3) break;
  }
  return picks;
}

// ======================== 请求处理 ========================

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const category = url.searchParams.get("category") || "all";
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const limitRaw = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 100)) : 50;

    const { items, failed } = await loadAll();
    if (items.length === 0) {
      return json({ error: "所有新闻源都暂时不可用，请稍后再试", failed }, 502);
    }

    let list = items;
    if (category === "social" || category === "industry") {
      list = list.filter((i) => i.category === category);
    }
    if (q) {
      list = list.filter((i) =>
        (i.title + " " + i.summary + " " + i.source).toLowerCase().includes(q)
      );
    }
    list = list.slice(0, limit);

    const now = new Date();
    return json({
      updatedAt: now.toISOString(),
      dailyTopic: (DAILY_TOPICS[now.getDay()] ?? DAILY_TOPICS[1]).label,
      daily: pickDaily(items),
      items: list,
      failed: failed.length > 0 ? failed.map((f) => f.id) : [],
    });
  } catch (err) {
    return json({ error: "新闻服务异常：" + String(err).slice(0, 200) }, 500);
  }
}
