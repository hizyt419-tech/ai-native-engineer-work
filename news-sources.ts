// ======================== 新闻源配置 ========================
// 在这里增删新闻源即可，无需改动其他代码
// category: social = 社会新闻, industry = 生产/行业新闻

export interface NewsSource {
  id: string;
  name: string;
  category: "social" | "industry";
  url: string;
  type: "rss" | "atom";
}

// 已实测可用的源（2026-08-13 在 Node 运行时验证，与 Cloudflare Pages Function 环境一致）
// 注意：新浪各频道 RSS 已停更（2018 旧数据）、RSSHub 公共实例 403、
//       feedx.net 拒绝 Node/Workers 客户端、澎湃/界面官方 RSS 已下线，均不可用
export const NEWS_SOURCES: NewsSource[] = [
  // 社会新闻
  {
    id: "chinanews",
    name: "中国新闻网",
    category: "social",
    url: "https://www.chinanews.com.cn/rss/scroll-news.xml",
    type: "rss",
  },
  {
    id: "people",
    name: "人民网",
    category: "social",
    url: "https://www.people.com.cn/rss/politics.xml",
    type: "rss",
  },
  // 生产/行业新闻
  {
    id: "tmtpost",
    name: "钛媒体",
    category: "industry",
    url: "https://www.tmtpost.com/rss",
    type: "rss",
  },
  {
    id: "ifanr",
    name: "爱范儿",
    category: "industry",
    url: "https://www.ifanr.com/feed",
    type: "rss",
  },
  {
    id: "geekpark",
    name: "极客公园",
    category: "industry",
    url: "https://www.geekpark.net/rss",
    type: "rss",
  },
  {
    id: "qbitai",
    name: "量子位",
    category: "industry",
    url: "https://www.qbitai.com/feed",
    type: "rss",
  },
];

// ======================== 每日精选主题（按星期轮换，打破信息茧房） ========================
// day: 0=周日, 1=周一 ... 6=周六

export interface DailyTopic {
  label: string;
  keywords: string[];
}

export const DAILY_TOPICS: Record<number, DailyTopic> = {
  1: {
    label: "宏观经济",
    keywords: ["经济", "宏观", "GDP", "财政", "央行", "货币", "出口", "消费", "投资", "汇率"],
  },
  2: {
    label: "制造装备",
    keywords: ["制造", "装备", "机械", "机床", "工业", "工厂", "产能", "供应链", "自动化", "机器人"],
  },
  3: {
    label: "科技前沿",
    keywords: ["科技", "AI", "人工智能", "芯片", "半导体", "算力", "软件", "数字化", "智能", "大模型"],
  },
  4: {
    label: "能源材料",
    keywords: ["能源", "新能源", "电力", "光伏", "锂", "电池", "钢铁", "化工", "石油", "材料"],
  },
  5: {
    label: "社会民生",
    keywords: ["民生", "就业", "社保", "教育", "医疗", "住房", "消费", "出行", "政策", "养老"],
  },
  0: {
    label: "深度观察",
    keywords: ["深度", "观点", "解读", "专访", "观察", "报告", "展望", "分析"],
  },
  6: {
    label: "深度观察",
    keywords: ["深度", "观点", "解读", "专访", "观察", "报告", "展望", "分析"],
  },
};
