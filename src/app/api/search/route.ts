import { NextResponse } from "next/server";

// 每日推荐内容池 —— 类别 → 多条内容
// 每天根据日期 hash 选出不同组合，模拟"每日推荐"
const INSPIRATION_POOL = [
  {
    title: "🌅 每日金句",
    snippet:
      "「学而不思则罔，思而不学则殆。」—— 学习需要思考与实践并行，知识才能真正内化。今日不妨放慢脚步，仔细回味学过的内容。",
    url: "",
    source: "论语 · 为政",
  },
  {
    title: "🚀 创造者思维",
    snippet:
      "The best way to predict the future is to invent it. 预测未来的最好方式，就是亲手创造它。代码、文字、设计——每一个创造都在塑造明天的世界。",
    url: "",
    source: "Alan Kay",
  },
  {
    title: "🧠 费曼学习法",
    snippet:
      "如果你不能简单地解释一件事，说明你还没有真正理解它。试着把今天学到的概念讲给一个完全不懂的人听，你会发现知识缺口在哪里。",
    url: "",
    source: "Richard Feynman",
  },
  {
    title: "💪 成长心态",
    snippet:
      "「三人行，必有我师焉。择其善者而从之，其不善者而改之。」—— 每个人都有值得学习的地方，保持开放的心态，每天进步1%。",
    url: "",
    source: "论语 · 述而",
  },
  {
    title: "✨ 坚持的力量",
    snippet:
      "不积跬步，无以至千里；不积小流，无以成江海。每天学习的微小积累，终将汇成知识的海洋。今天学了什么不重要，重要的是今天学了。",
    url: "",
    source: "荀子 · 劝学",
  },
  {
    title: "🎯 深度工作",
    snippet:
      "专注是把有限的时间与注意力，投入到最重要的事情上。关闭通知、远离手机、给自己一段不被打扰的学习时间。",
    url: "",
    source: "Cal Newport · Deep Work",
  },
  {
    title: "🔍 好奇心驱动",
    snippet:
      "The important thing is not to stop questioning. Curiosity has its own reason for existing. —— 永远不要停止提问，好奇心是最好的老师。",
    url: "",
    source: "Albert Einstein",
  },
  {
    title: "🌿 终身学习",
    snippet:
      "活到老，学到老。技术日新月异的时代，唯一不会过时的能力，就是持续学习的能力。把学习变成一种生活方式，而不是任务。",
    url: "",
    source: "终身学习理念",
  },
];

const ENGLISH_POOL = [
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
      "虚拟语气 (Subjunctive)：\nIf I were you, I would start learning English today.\n如果我是你，我会今天就开���学英语。\n\n注意：不说 If I was you，而说 If I were you。",
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

// 简单的日期哈希，用于每天选不同的内容
function dailyIndex(seed: number, max: number): number {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000
  );
  return (dayOfYear * seed * 7 + seed * 13) % max;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";

  // 尝试从 DuckDuckGo 搜索（免费、无需 API key）
  let webResults: typeof INSPIRATION_POOL = [];

  if (category === "inspiration" || category === "all") {
    try {
      const query = "每日金句 学习动力 名言";
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        const topics = data.RelatedTopics?.slice(0, 2) || [];
        const webItems = topics
          .filter((t: { Text?: string; FirstURL?: string }) => t.Text)
          .map((t: { Text: string; FirstURL: string }) => ({
            title: "🔗 网络推荐",
            snippet: t.Text.split(" - ")[0]?.slice(0, 300) || t.Text.slice(0, 300),
            url: t.FirstURL || "",
            source: "网络搜索",
          }));
        if (webItems.length > 0) {
          webResults = [...webResults, ...webItems];
        }
      }
    } catch {
      // 搜索失败不影响，用内容池兜底
    }
  }

  if (category === "english" || category === "all") {
    try {
      const query = "learn English daily tip vocabulary";
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        const topics = data.RelatedTopics?.slice(0, 2) || [];
        const webItems = topics
          .filter((t: { Text?: string; FirstURL?: string }) => t.Text)
          .map((t: { Text: string; FirstURL: string }) => ({
            title: "🔗 English Tip",
            snippet: t.Text.split(" - ")[0]?.slice(0, 300) || t.Text.slice(0, 300),
            url: t.FirstURL || "",
            source: "Web Search",
          }));
        if (webItems.length > 0) {
          webResults = [...webResults, ...webItems];
        }
      }
    } catch {
      // ignore
    }
  }

  // 从内容池按日期选取（确保每天内容不同）
  let poolItems: typeof INSPIRATION_POOL = [];

  if (category === "inspiration" || category === "all") {
    const idx = dailyIndex(42, INSPIRATION_POOL.length);
    const selected: typeof INSPIRATION_POOL = [];
    for (let i = 0; i < 2; i++) {
      selected.push(INSPIRATION_POOL[(idx + i) % INSPIRATION_POOL.length]);
    }
    poolItems = [...poolItems, ...selected];
  }

  if (category === "english" || category === "all") {
    const idx = dailyIndex(7, ENGLISH_POOL.length);
    const selected: typeof ENGLISH_POOL = [];
    for (let i = 0; i < 2; i++) {
      selected.push(ENGLISH_POOL[(idx + i) % ENGLISH_POOL.length]);
    }
    poolItems = [...poolItems, ...selected];
  }

  // 合并网络结果和内容池结果
  const allResults = [...webResults, ...poolItems];

  return NextResponse.json({
    results: allResults,
    searched_at: new Date().toISOString(),
    from_cache: webResults.length === 0,
  });
}
