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
  const [items, setItems] = useState<ListItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"book" | "movie" | "show">("book");
  const [activeStatus, setActiveStatus] = useState<"want" | "doing" | "done" | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const filtered = items.filter((i) => {
    if (i.category !== activeCategory) return false;
    if (activeStatus && i.status !== activeStatus) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setItems((prev) => [
      {
        id: Date.now(),
        title: newTitle.trim(),
        category: activeCategory,
        status: "want",
      },
      ...prev,
    ]);
    setNewTitle("");
    setShowAdd(false);
  };

  const handleStatusChange = (id: number, status: "want" | "doing" | "done") => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

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
              onClick={() => setActiveStatus(activeStatus === s.key ? null : s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeStatus === s.key
                  ? "bg-mustard text-white shadow-sm"
                  : "text-warm-400 bg-white hover:text-warm-600 hover:shadow-sm"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* 添加栏 */}
        {showAdd ? (
          <div className="card p-4 mb-4 space-y-3">
            <input
              autoFocus
              className="w-full p-2.5 border border-warm-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard/20 focus:border-mustard bg-cream/50 text-warm-800 text-sm placeholder:text-warm-400/50"
              placeholder={`添加${CATEGORIES.find((c) => c.key === activeCategory)?.label}...`}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAdd(false); }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 text-xs text-warm-400 hover:text-warm-600">取消</button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="px-5 py-1.5 bg-mustard text-white rounded-full text-sm font-medium hover:bg-mustard/90 disabled:opacity-30 transition-all shadow-sm active:scale-95"
              >
                添加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full card p-3 mb-4 text-center text-sm text-warm-400 hover:text-mustard transition-colors font-medium border-dashed"
          >
            + 添加{CATEGORIES.find((c) => c.key === activeCategory)?.label}
          </button>
        )}

        {/* 列表 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">
              {activeCategory === "book" ? "📖" : activeCategory === "movie" ? "🎬" : "📺"}
            </p>
            <p className="text-warm-400 text-sm">
              {items.filter((i) => i.category === activeCategory).length === 0
                ? "还没有添加任何内容"
                : "没有符合筛选条件的内容"}
            </p>
            <p className="text-warm-400/50 text-xs mt-1">看到好书好片，记下来别忘</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-800 truncate">{item.title}</p>
                  <p className="text-xs text-warm-400 mt-0.5">
                    {CATEGORIES.find((c) => c.key === item.category)?.icon}{" "}
                    {STATUSES.find((s) => s.key === item.status)?.label}
                  </p>
                </div>
                {/* 状态切换 */}
                <div className="flex gap-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleStatusChange(item.id, s.key)}
                      className={`text-xs px-2 py-1 rounded-full transition-all ${
                        item.status === s.key
                          ? "bg-mustard text-white"
                          : "text-warm-400 hover:bg-warm-border-light"
                      }`}
                      title={s.label}
                    >
                      {s.icon}
                    </button>
                  ))}
                </div>
                {/* 删除 */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-warm-400/40 hover:text-red-400 transition-colors text-xs w-6 h-6 flex items-center justify-center flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 计数 */}
        {items.length > 0 && (
          <p className="text-center text-xs text-warm-400/60 mt-4">
            共 {items.length} 项 · {items.filter((i) => i.status === "done").length} 已完成
          </p>
        )}
      </div>
    </div>
  );
}
