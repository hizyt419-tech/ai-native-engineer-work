"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addNote } from "../../lib/noteStore";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  sourceId: string;
  category: "social" | "industry";
  time: string;
  summary: string;
}

interface NewsPayload {
  updatedAt: string;
  dailyTopic: string;
  daily: NewsItem[];
  items: NewsItem[];
}

interface ExplainState {
  open: boolean;
  loading: boolean;
  text: string;
  result: string;
  error: string;
  source: NewsItem | null;
}

const CATEGORIES = [
  { key: "all", label: "全部", icon: "🌐" },
  { key: "social", label: "社会新闻", icon: "📰" },
  { key: "industry", label: "生产新闻", icon: "🏭" },
] as const;

type CatKey = (typeof CATEGORIES)[number]["key"];

const CATEGORY_META: Record<"social" | "industry", { label: string; badge: string; edge: string }> = {
  social: { label: "社会", badge: "bg-sky-bg text-warm-800", edge: "edge-social" },
  industry: { label: "生产", badge: "bg-sage-bg text-warm-800", edge: "edge-industry" },
};

const CACHE_KEY = "wb_news_cache";

function formatTime(iso: string): string {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  const now = new Date();
  const diff = now.getTime() - t.getTime();
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`;
  if (diff < 86_400_000 && now.getDate() === t.getDate()) {
    return `${Math.floor(diff / 3_600_000)}小时前`;
  }
  return `${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function getSelectedText(): string {
  const sel = window.getSelection()?.toString().trim() || "";
  return sel.length > 0 && sel.length <= 100 ? sel : "";
}

function LongPressable({
  onLongPress,
  children,
  className,
}: {
  onLongPress: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const timer = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const start = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    timer.current = window.setTimeout(() => {
      timer.current = null;
      onLongPress();
    }, 550);
  };
  const cancel = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const move = (e: React.PointerEvent) => {
    const p = startPos.current;
    if (p && (Math.abs(e.clientX - p.x) > 8 || Math.abs(e.clientY - p.y) > 8)) {
      startPos.current = null;
      cancel();
    }
  };

  return (
    <div
      className={className}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onPointerMove={move}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress();
      }}
    >
      {children}
    </div>
  );
}

export default function NewsPage() {
  const [payload, setPayload] = useState<NewsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<CatKey>("all");
  const [query, setQuery] = useState("");

  const [menuItem, setMenuItem] = useState<NewsItem | null>(null);
  const [menuText, setMenuText] = useState("");

  const [explain, setExplain] = useState<ExplainState>({
    open: false,
    loading: false,
    text: "",
    result: "",
    error: "",
    source: null,
  });

  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  };

  // ======================== 抓取新闻 ========================

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      if (!res.ok) throw new Error("新闻服务不可用");
      const data = (await res.json()) as NewsPayload;
      setPayload(data);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
      } catch {
        // 忽略缓存失败
      }
    } catch {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { data: NewsPayload };
          setPayload(parsed.data);
          setError("新闻服务暂时不可用，正在显示上次缓存");
        } else {
          setError(
            "新闻服务不可用：本地开发请用 `npx wrangler pages dev` 启动，或部署到 Cloudflare Pages 后使用"
          );
        }
      } catch {
        setError("新闻服务不可用，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // ======================== 过滤 ========================

  const filtered = useMemo(() => {
    const base = payload?.items || [];
    const byCat = category === "all" ? base : base.filter((i) => i.category === category);
    const q = query.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter((i) =>
      (i.title + " " + i.summary + " " + i.source).toLowerCase().includes(q)
    );
  }, [payload, category, query]);

  // ======================== 操作 ========================

  const openAction = (item: NewsItem) => {
    setMenuText(getSelectedText());
    setMenuItem(item);
  };

  const targetText = (item: NewsItem) =>
    menuText || `${item.title}${item.summary ? "，" + item.summary : ""}`;

  const saveSentence = () => {
    if (!menuItem) return;
    addNote({
      content: targetText(menuItem),
      type: "note",
      sourceUrl: menuItem.url,
    });
    setMenuItem(null);
    setMenuText("");
    showToast("已存入笔记 📝");
  };

  const runExplain = async (text: string, source: NewsItem | null) => {
    if (!text.trim()) return;
    setExplain({ open: true, loading: true, text, result: "", error: "", source });
    setMenuItem(null);
    setMenuText("");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "解读失败，请稍后重试");
      setExplain({
        open: true,
        loading: false,
        text,
        result: data.text || data.error || "",
        error: "",
        source,
      });
    } catch (err) {
      setExplain({
        open: true,
        loading: false,
        text,
        result: "",
        error: String(err).replace(/^Error:\s*/, ""),
        source,
      });
    }
  };

  const explainFromMenu = () => {
    if (!menuItem) return;
    runExplain(targetText(menuItem), menuItem);
  };

  const saveExplanation = () => {
    if (!explain.result) return;
    addNote({
      content: explain.result,
      type: "idea",
      keyword: explain.text,
      sourceUrl: explain.source?.url,
      explanation: explain.result,
    });
    setExplain((s) => ({ ...s, open: false }));
    showToast("解读已存入笔记 💡");
  };

  const closeExplain = () => setExplain((s) => ({ ...s, open: false }));

  // ======================== 日期眉线 ========================

  const dateLine = useMemo(() => {
    const d = new Date();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${d.getMonth() + 1}月${d.getDate()}日 · 周${weekdays[d.getDay()]}`;
  }, []);

  // ======================== 渲染 ========================

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-6">
        {/* 顶部：日期眉线 + 标题 + 刷新 */}
        <header className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-warm-400">{dateLine}</p>
            <h1 className="text-xl font-bold text-warm-800 mt-1">每日新闻</h1>
          </div>
          <button
            onClick={loadNews}
            disabled={loading}
            className="px-4 py-2 bg-white text-warm-600 rounded-full text-sm font-medium border border-warm-border-light shadow-soft hover:text-mustard disabled:opacity-40 transition-all active:scale-95"
          >
            {loading ? "加载中…" : "🔄 刷新"}
          </button>
        </header>

        {error && (
          <p className="mb-4 text-xs text-warm-600 bg-amber-bg rounded-xl px-3 py-2">{error}</p>
        )}

        {/* 今日精选 —— 当日特刊 */}
        {payload && payload.daily.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="stamp" aria-hidden="true">
                {payload.dailyTopic}
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] text-warm-400">每天换一个角度</p>
                <h2 className="text-base font-bold text-warm-800 leading-tight">今日精选</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              {payload.daily.slice(0, 3).map((item, idx) => (
                <LongPressable
                  key={"daily-" + idx + "-" + item.url}
                  onLongPress={() => openAction(item)}
                  className={`card paper-dots p-4 transition-transform active:scale-[0.99] select-text rise-in rise-in-${idx + 1}`}
                >
                  <NewsCardContent item={item} onAsk={() => openAction(item)} display />
                </LongPressable>
              ))}
            </div>
          </section>
        )}

        {/* 分类 Tab（分段控件） */}
        <div className="bg-mustard-bg/70 border border-warm-border-light rounded-full p-1 mb-3 flex gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                category === c.key
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-400 hover:text-warm-600"
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* 检索条 */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索关键词，如：机器人、芯片、新能源…"
            className="w-full pl-10 pr-9 py-2.5 border border-warm-border-light rounded-full focus:outline-none focus:ring-2 focus:ring-mustard/20 focus:border-mustard bg-white text-warm-800 text-sm placeholder:text-warm-400/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* 列表 */}
        {loading && !payload ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-3 w-16 bg-warm-border-light rounded-full mb-3" />
                <div className="h-4 bg-warm-border-light rounded-full mb-2" />
                <div className="h-3 w-3/4 bg-warm-border-light rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🗞️</p>
            <p className="text-warm-400 text-sm">
              {query ? "没有匹配的新闻，换个关键词试试" : "这里还没有新闻，稍后刷新"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <LongPressable
                key={item.sourceId + "-" + item.url}
                onLongPress={() => openAction(item)}
                className={`card p-4 ${CATEGORY_META[item.category].edge} transition-transform active:scale-[0.99] select-text`}
              >
                <NewsCardContent item={item} onAsk={() => openAction(item)} />
              </LongPressable>
            ))}
          </div>
        )}

        {/* 提示 */}
        <p className="text-center text-xs text-warm-400/60 mt-5">
          长按或选中句子可「存笔记 / AI 解读」· 点击标题查看原文
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-warm-800 text-white rounded-full text-sm shadow-soft-lg">
          {toast}
        </div>
      )}

      {/* 长按操作条 */}
      {menuItem && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuItem(null)}>
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute bottom-20 inset-x-0 max-w-2xl mx-auto px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card p-4">
              <p className="text-[10px] tracking-[0.18em] text-warm-400 mb-1">对这条新闻</p>
              <p className="text-sm font-medium text-warm-800 line-clamp-2">{menuItem.title}</p>
              {menuText && (
                <p className="text-xs text-mustard mt-1.5 line-clamp-2">已选：「{menuText}」</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveSentence}
                  className="flex-1 py-2.5 rounded-xl bg-mustard-bg text-warm-800 text-sm font-medium hover:bg-mustard/20 transition-all active:scale-95"
                >
                  📝 存笔记
                </button>
                <button
                  onClick={explainFromMenu}
                  className="flex-1 py-2.5 rounded-xl bg-lilac-bg text-warm-800 text-sm font-medium hover:bg-lilac/50 transition-all active:scale-95"
                >
                  🤖 AI 解读
                </button>
                <button
                  onClick={() => setMenuItem(null)}
                  className="px-4 py-2.5 rounded-xl text-warm-400 hover:text-warm-600 text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI 解读弹窗 */}
      {explain.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/25">
          <div
            className="w-full max-w-lg card p-5 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] tracking-[0.18em] text-warm-400">AI 解读</p>
                <h3 className="text-base font-bold text-warm-800">🤖 这段说的是什么</h3>
              </div>
              <button
                onClick={closeExplain}
                className="text-warm-400 hover:text-warm-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-warm-600 bg-cream rounded-xl p-2.5 mb-3 line-clamp-3 whitespace-pre-wrap break-words">
              {explain.text}
            </p>

            {explain.loading ? (
              <div className="py-10 text-center">
                <div className="inline-block w-8 h-8 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-warm-400 mt-3">正在解读…</p>
              </div>
            ) : explain.result ? (
              <>
                <p className="font-display text-[15px] text-warm-800 whitespace-pre-wrap leading-relaxed">
                  {explain.result}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={closeExplain}
                    className="px-4 py-2 text-sm text-warm-400 hover:text-warm-600"
                  >
                    关闭
                  </button>
                  <button
                    onClick={saveExplanation}
                    className="px-5 py-2 bg-mustard text-white rounded-full text-sm font-medium hover:bg-mustard/90 transition-all active:scale-95"
                  >
                    📥 存入笔记
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-red-400 break-words">{explain.error}</p>
                <button
                  onClick={() => runExplain(explain.text, explain.source)}
                  className="mt-3 px-5 py-2 bg-mustard text-white rounded-full text-sm font-medium"
                >
                  重试
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NewsCardContent({
  item,
  onAsk,
  display = false,
}: {
  item: NewsItem;
  onAsk: () => void;
  display?: boolean;
}) {
  const meta = CATEGORY_META[item.category];
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${meta.badge}`}>
            {meta.label}
          </span>
          <span className="text-[11px] text-warm-400 truncate">{item.source}</span>
          <span className="text-[11px] text-warm-400/70 flex-shrink-0">
            {formatTime(item.time)}
          </span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className={
            display
              ? "font-display text-[17px] font-bold text-warm-800 leading-snug hover:text-mustard transition-colors line-clamp-3"
              : "text-sm font-medium text-warm-800 leading-snug hover:text-mustard transition-colors line-clamp-2"
          }
        >
          {item.title}
        </a>
        {item.summary && (
          <p className="text-xs text-warm-400 mt-1 line-clamp-2 leading-relaxed">{item.summary}</p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAsk();
        }}
        title="AI 解读 / 存笔记"
        className="flex-shrink-0 w-8 h-8 rounded-full bg-lilac-bg text-warm-600 hover:bg-lilac hover:text-warm-800 transition-all flex items-center justify-center text-sm"
      >
        🤖
      </button>
    </div>
  );
}
