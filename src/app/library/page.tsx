"use client";

import { useState } from "react";

interface ListItem {
  id: number;
  title: string;
  category: "book" | "movie" | "show";
  status: "want" | "doing" | "done";
  rating?: number;
}

const CATEGORIES = [
  { key: "book" as const, label: "书籍", icon: "📖" },
  { key: "movie" as const, label: "电影", icon: "🎬" },
  { key: "show" as const, label: "剧集", icon: "📺" },
];

const STATUSES = [
  { key: "want" as const, label: "想看", icon: "🔖" },
  { key: "doing" as const, label: "在看", icon: "👀" },
  { key: "done" as const, label: "看过", icon: "✅" },
];

export default function LibraryPage() {
  const [items] = useState<ListItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"book" | "movie" | "show">("book");

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 pt-6">
        {/* 标题 */}
        <div className="card p-5 mb-4">
          <h1 className="text-lg font-bold text-warm-800 flex items-center gap-2">
            📚 阅读观影清单
          </h1>
          <p className="text-sm text-warm-400 mt-1">追踪你想看的、正在看的、已经看过的</p>
        </div>

        {/* 分类 Tab */}
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-400 hover:text-warm-600"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* 状态筛选 */}
        <div className="flex gap-2 mb-4">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-warm-400 bg-white hover:text-warm-600 hover:shadow-sm transition-all"
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* 空状态 */}
        {items.filter((i) => i.category === activeCategory).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">
              {activeCategory === "book" ? "📖" : activeCategory === "movie" ? "🎬" : "📺"}
            </p>
            <p className="text-warm-400 text-sm">还没有添加任何内容</p>
            <p className="text-warm-400/50 text-xs mt-1">看到好书好片，记下来别忘</p>
            <button className="mt-4 px-5 py-2 bg-mustard text-white rounded-full text-sm font-medium hover:bg-mustard/90 transition-all shadow-sm active:scale-95">
              + 添加
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items
              .filter((i) => i.category === activeCategory)
              .map((item) => (
                <div key={item.id} className="card p-4">
                  <p className="text-sm font-medium text-warm-800">{item.title}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
