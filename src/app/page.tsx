"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { LearningNote, NoteCategory, SearchResult } from "../types/note";
import { parseMetadata, encodeMetadata } from "../types/note";

// ======================== 常量 ========================

const TABS: { key: NoteCategory; label: string; icon: string }[] = [
  { key: "general", label: "笔记", icon: "📝" },
  { key: "inspiration", label: "灵感", icon: "💡" },
  { key: "english", label: "英语", icon: "🇬🇧" },
];

// ======================== 主组件 ========================

export default function Home() {
  // ---- 状态 ----
  const [activeTab, setActiveTab] = useState<NoteCategory>("general");
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  // ---- 加载笔记 ----
  const loadNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data as LearningNote[]);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // ---- 语音识别初始化 ----
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const sr = new (window as any).webkitSpeechRecognition();
      sr.continuous = true;
      sr.interimResults = true;
      sr.lang = "zh-CN";
      sr.onresult = (event: any) => {
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if (final) setNoteContent((prev) => prev + final);
      };
      sr.onerror = () => setIsListening(false);
      sr.onend = () => setIsListening(false);
      setRecognition(sr);
    }
  }, []);

  // ---- 保存笔记 ----
  const saveNote = async () => {
    if (!noteContent.trim()) return;
    const meta = encodeMetadata({
      category: activeTab,
      is_favorite: false,
      source: isListening ? "speech" : "manual",
    });

    const { error } = await supabase
      .from("notes")
      .insert([{ content: noteContent, type: "text", title: meta }]);

    if (!error) {
      setNoteContent("");
      loadNotes();
    }
  };

  // ---- 图片上传 ----
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const meta = encodeMetadata({
        category: activeTab,
        is_favorite: false,
        source: "manual",
      });
      await supabase
        .from("notes")
        .insert([{ content: reader.result as string, type: "image", title: meta }]);
      e.target.value = "";
      loadNotes();
    };
    reader.readAsDataURL(file);
  };

  // ---- 语音切换 ----
  const toggleSpeech = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      if (noteContent.trim()) saveNote();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // ---- 删除笔记 ----
  const deleteNote = async (id: number) => {
    await supabase.from("notes").delete().eq("id", id);
    loadNotes();
  };

  // ---- 切换收藏 ----
  const toggleFavorite = async (note: LearningNote) => {
    const meta = parseMetadata(note);
    meta.is_favorite = !meta.is_favorite;
    await supabase
      .from("notes")
      .update({ title: encodeMetadata(meta) })
      .eq("id", note.id);
    loadNotes();
  };

  // ---- 收藏搜索到的内容 ----
  const saveSearchResult = async (result: SearchResult, category: NoteCategory) => {
    const meta = encodeMetadata({
      category,
      is_favorite: false,
      source: "web_search",
      source_url: result.url || undefined,
    });
    await supabase
      .from("notes")
      .insert([{ content: result.snippet, type: "text", title: meta }]);
    loadNotes();
    setSearchMessage(`已收藏「${result.title.slice(0, 20)}...」到${category === "inspiration" ? "灵感" : "英语"}`);
    setTimeout(() => setSearchMessage(""), 2000);
  };

  // ---- 每日搜索 ----
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const fetchDailyContent = async () => {
    setIsSearching(true);
    setShowSearchPanel(true);
    try {
      const res = await fetch(`/api/search?category=${activeTab}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // ---- 筛选逻辑 ----
  const filteredNotes = notes.filter((note) => {
    const meta = parseMetadata(note);
    if (meta.category !== activeTab) return false;
    if (showFavoritesOnly && !meta.is_favorite) return false;
    return true;
  });

  // ---- 当前 tab 信息 ----
  const currentTab = TABS.find((t) => t.key === activeTab)!;

  // ---- 渲染 ----
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ===== 顶部导航 ===== */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-center text-xl font-bold py-3 text-zinc-900 dark:text-white">
            我的学习笔记
          </h1>
          {/* Tab 切换 */}
          <nav className="flex gap-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setShowSearchPanel(false);
                }}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ===== 工具栏 ===== */}
      <div className="max-w-3xl mx-auto w-full px-4 py-3 flex items-center gap-2 flex-wrap">
        {/* 每日搜索按钮 */}
        <button
          onClick={fetchDailyContent}
          disabled={isSearching}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
            isSearching
              ? "bg-zinc-200 text-zinc-500 cursor-wait"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300"
          }`}
        >
          {isSearching ? "⏳" : "🔍"} {isSearching ? "搜索中..." : "搜索推荐"}
        </button>

        {/* 收藏筛选 */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
            showFavoritesOnly
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {showFavoritesOnly ? "⭐" : "☆"} {showFavoritesOnly ? "只看收藏" : "收藏"}
        </button>

        {/* 提示信息 */}
        {searchMessage && (
          <span className="text-xs text-green-600 dark:text-green-400 animate-pulse">
            {searchMessage}
          </span>
        )}
      </div>

      {/* ===== 搜索结果面板 ===== */}
      {showSearchPanel && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                🔍 推荐内容 — {activeTab === "inspiration" ? "灵感" : activeTab === "english" ? "英语" : "笔记"}
              </h3>
              <button
                onClick={() => setShowSearchPanel(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-sm text-zinc-500">
                {isSearching ? "正在搜索相关内容..." : "暂无推荐内容，请稍后重试。"}
              </p>
            ) : (
              <ul className="space-y-3">
                {searchResults.map((r, i) => (
                  <li
                    key={i}
                    className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-blue-100 dark:border-blue-900/50"
                  >
                    <p className="font-medium text-sm text-zinc-800 dark:text-zinc-100 mb-1">
                      {r.title}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                      {r.snippet.slice(0, 400)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-zinc-400">{r.source}</span>
                      <button
                        onClick={() => saveSearchResult(r, activeTab)}
                        className="text-xs px-3 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        + 收藏
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ===== 笔记列表 ===== */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-24">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{currentTab.icon}</p>
            <p className="text-zinc-400 dark:text-zinc-500">
              {showFavoritesOnly
                ? "还没有收藏任何内容"
                : `${currentTab.label}模块还没有笔记`}
            </p>
            <p className="text-sm text-zinc-300 dark:text-zinc-600 mt-1">
              {showFavoritesOnly
                ? "点击笔记右上角的 ☆ 来收藏"
                : activeTab === "general"
                  ? "在下方输入框写下第一条笔记吧"
                  : "点击上方「搜索推荐」获取每日灵感和英语内容"}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredNotes.map((note) => {
              const meta = parseMetadata(note);
              return (
                <li
                  key={note.id}
                  className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* 收藏按钮 */}
                  <button
                    onClick={() => toggleFavorite(note)}
                    className="absolute top-3 right-3 text-lg transition-transform hover:scale-125"
                    title={meta.is_favorite ? "取消收藏" : "收藏"}
                  >
                    {meta.is_favorite ? "⭐" : "☆"}
                  </button>

                  {/* 内容 */}
                  {note.type === "image" ? (
                    <img
                      src={note.content}
                      alt="学习图片"
                      className="max-w-full h-auto rounded-md max-h-80"
                    />
                  ) : (
                    <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed pr-8">
                      {note.content}
                    </p>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span>
                        {new Date(note.created_at).toLocaleDateString("zh-CN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {meta.source === "web_search" && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
                          🔗 推荐
                        </span>
                      )}
                      {meta.source === "speech" && (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                          🎤 语音
                        </span>
                      )}
                      {meta.source_url && (
                        <a
                          href={meta.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline truncate max-w-[120px]"
                        >
                          🔗 来源
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* ===== 底部输入栏（仅笔记 tab） ===== */}
      {activeTab === "general" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-end gap-3">
            <textarea
              className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white resize-none text-sm"
              rows={2}
              placeholder="记录学习内容..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveNote();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-center">
                🖼
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <button
                onClick={toggleSpeech}
                disabled={!recognition}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300"
                }`}
                title={isListening ? "停止录音" : "语音输入"}
              >
                {isListening ? "⏹" : "🎤"}
              </button>
              <button
                onClick={saveNote}
                disabled={!noteContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
