"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { path: "/", label: "工作台", icon: "📋" },
  { path: "/dashboard", label: "看板", icon: "📊" },
  { path: "/notes", label: "笔记", icon: "📝" },
  { path: "/news", label: "新闻", icon: "📰" },
  { path: "/library", label: "清单", icon: "📚" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-t border-warm-border-light safe-area-bottom">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const active =
            tab.path === "/" ? pathname === "/" : pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-2xl transition-all duration-200 ${
                active
                  ? "bg-mustard-bg text-warm-800"
                  : "text-warm-400 hover:text-warm-600"
              }`}
            >
              <span
                className={`text-xl transition-transform duration-200 ${
                  active ? "scale-110" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
