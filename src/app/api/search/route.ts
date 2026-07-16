import { NextResponse } from "next/server";

// ======================== 知乎日报 API ========================

const ZHIHU_API = "https://news-at.zhihu.com/api/4/news/latest";

interface ZhihuStory {
  id: number;
  title: string;
  hint: string;
  url: string;
  images?: string[];
}

interface ZhihuStoryDetail {
  id: number;
  title: string;
  body: string; // HTML
  image?: string;
  share_url: string;
}

// 去除 HTML 标签，提取纯文本
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchZhihuStories(): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const seenIds = new Set<number>();

  // 1. 获取今日列表
  const listRes = await fetch(ZHIHU_API, {
    signal: AbortSignal.timeout(5000),
  });
  if (!listRes.ok) return results;

  const list = await listRes.json();
  // 合并 top_stories 和 stories，去重
  const allStories: ZhihuStory[] = [];
  for (const s of list.top_stories || []) {
    if (!seenIds.has(s.id)) {
      allStories.push(s);
      seenIds.add(s.id);
    }
  }
  for (const s of list.stories || []) {
    if (!seenIds.has(s.id)) {
      allStories.push(s);
      seenIds.add(s.id);
    }
  }

  // 2. 获取文章详情（最多3篇）
  for (const s of allStories.slice(0, 3)) {
    try {
      const detailRes = await fetch(
        `https://news-at.zhihu.com/api/4/news/${s.id}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!detailRes.ok) continue;

      const detail: ZhihuStoryDetail = await detailRes.json();
      let plainText = stripHtml(detail.body || "");

      // 知乎正文格式：作者简介 ... 查看知乎原文 ... 正文
      // 截取「查看知乎原文」之后的部分，去掉作者介绍
      const idx = plainText.indexOf("查看知乎原文");
      if (idx !== -1) {
        plainText = plainText.slice(idx + 6).trim();
      } else {
        // 如果没找到标记，就去掉开头的「作者 / xxx」
        plainText = plainText.replace(/^作者\s*\/\s*\S+/, "").trim();
      }
      plainText = plainText.replace(/^\s+/, "");

      results.push({
        title: s.title,
        snippet:
          plainText.slice(0, 350) + (plainText.length > 350 ? "…" : ""),
        url:
          detail.share_url ||
          s.url ||
          `https://daily.zhihu.com/story/${s.id}`,
        source: `知乎日报 · ${s.hint?.split("·")[0]?.trim() || "今日推荐"}`,
      });
    } catch {
      continue;
    }
  }

  return results;
}

// ======================== 英语内容池（兜底） ========================

const ENGLISH_POOL: SearchResult[] = [
  {
    title: "📖 每日一句",
    snippet:
      "Practice makes perfect. 熟能生巧。\nDon't be afraid to make mistakes — every error is a step toward fluency. 别怕犯错，每个错误都是通向流利的一步。",
    url: "",
    source: "English Proverb",
  },
  {
    title: "🗣 口语表达",
    snippet:
      "「It's on the tip of my tongue.」\n话就在嘴边，但一时想不起来。\n\n用法：当你暂时想不起某个词或名字时，这是一个非常地道自然的表达方式。",
    url: "",
    source: "地道英语表达",
  },
  {
    title: "✍️ 词汇积累：Serendipity",
    snippet:
      "Serendipity /ˌserənˈdɪpəti/ (n.) 意外发现美好事物的能力；机缘巧合\n\n例句：Finding this book in that old shop was pure serendipity.\n在那家旧书店找到这本书纯属机缘巧合。",
    url: "",
    source: "每日词汇",
  },
  {
    title: "🎧 听力技巧",
    snippet:
      "影子跟读法 (Shadowing)：\n1. 选一段1-2分钟的英文音频\n2. 先听懂大意\n3. 跟着音频同步朗读，模仿语速和语调\n4. 每天练10分钟，一个月后听力明显提升",
    url: "",
    source: "英语学习方法",
  },
  {
    title: "📝 写作句型",
    snippet:
      "「Not only... but also...」倒装句\n\nNot only does regular reading expand your vocabulary, but it also sharpens your critical thinking.\n定期阅读不仅扩大词汇量，还能锻炼批判性思维。",
    url: "",
    source: "英语写作技巧",
  },
  {
    title: "💬 商务英语",
    snippet:
      "「Let's circle back to that later.」\n我们回头再讨论这个。\n\n在会议中需要暂时搁置某个话题时使用，比直接说「skip」更专业礼貌。",
    url: "",
    source: "职场英语",
  },
  {
    title: "🎯 语法点睛",
    snippet:
      "虚拟语气 (Subjunctive)：\nIf I were you, I would start learning English today.\n如果我是你，我会今天开始学英语。\n\n注意：不说 If I was you，而说 If I were you。",
    url: "",
    source: "英语语法",
  },
  {
    title: "🌍 文化冷知识",
    snippet:
      "英语中「Goodbye」的来源是什么？\n它来自16世纪的短语「God be with ye」（愿上帝与你同在），经过几百年的演变，缩成了现在的 Goodbye。",
    url: "",
    source: "英语文化",
  },
];

// ======================== 搜索类型 ========================

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

// 日期哈希——每天选不同英语内容
function dailyIndex(seed: number, max: number): number {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return (dayOfYear * seed * 7 + seed * 13) % max;
}

// ======================== API 入口 ========================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";

  const results: SearchResult[] = [];
  let sourceLabel = "";

  // ---- 灵感：知乎日报 ----
  if (category === "inspiration" || category === "all") {
    const zhihu = await fetchZhihuStories();
    if (zhihu.length > 0) {
      results.push(...zhihu);
      sourceLabel = "知乎日报";
    }
    // 如果知乎日报失败，不兜底——直接显示错误让用户知道
  }

  // ---- 英语：预设内容池 ----
  if (category === "english" || category === "all") {
    const idx = dailyIndex(7, ENGLISH_POOL.length);
    for (let i = 0; i < 2; i++) {
      results.push(ENGLISH_POOL[(idx + i) % ENGLISH_POOL.length]);
    }
  }

  return NextResponse.json({
    results,
    searched_at: new Date().toISOString(),
    source: sourceLabel || (category === "english" ? "内置内容池" : ""),
  });
}
