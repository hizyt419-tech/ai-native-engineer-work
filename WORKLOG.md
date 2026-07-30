# 每日工作台 — 开发日志

> 最后更新：2026-07-30

---

## 项目概况

| 项目 | 详情 |
|------|------|
| 名称 | 每日工作台 (my-learning-notes-app) |
| 仓库 | https://github.com/hizyt419-tech/ai-native-engineer-work |
| 线上地址 | Cloudflare Pages (`*.pages.dev`) |
| 技术栈 | Next.js 16 + React 19 + Tailwind CSS 4 + Supabase |
| 部署 | Cloudflare Pages（静态导出模式） |

---

## 当前完成的功能

### ✅ 核心：每日工作台 (`/`)

- 5 个固定板块：上班、兼职、运动、娱乐、临时事件
- 兼职板块支持计时 + 时薪算钱
- 临时事件可选计时
- 日历切换（月视图，可点击切换日期）
- 今日总结（含固定引导问题，AI 后续接入）
- 数据持久化到 Supabase

### ✅ 底部导航

- 工作台 (`/`)
- 看板 (`/dashboard`) — 统计卡片占位
- 笔记 (`/notes`) — 快速笔记/链接/灵感
- 清单 (`/library`) — 书籍/电影/剧集追踪

### ✅ 数据库（Supabase）

- `daily_boards` — 每日面板
- `board_tasks` — 任务（含计时、时薪、板块）

### ✅ 部署

- Cloudflare Pages 连接 GitHub 自动部署
- 静态导出模式 (`output: "export"`)
- 环境变量已配置

---

## 待解决的问题

### 🔴 UI 风格不满意

当前 Tailwind 实现与期望的「极简轻拟物治愈风」差距较大。

期望风格：
- 奶油米白底色 + 超大圆角 + 轻薄软阴影
- 芥末暖黄主色 + 莫兰迪大地色辅助
- 北欧极简、干净高级、移动端友好
- 无尖锐直角、无高饱和色、无厚重阴影

可能需要：
- 参考真实设计稿重新调整配色和间距
- 考虑使用设计系统（如 shadcn/ui）减少手写样式
- 或者直接用 CSS-in-JS 方案更精确控制

### 🟡 功能待完善

- 看板：实际数据统计、收入趋势图、周报生成
- 笔记：需接入 Supabase 持久化
- 清单：需接入 Supabase 持久化、搜索添加
- AI 引导总结

### 🟡 技术债务

- `src/types/note.ts` — 旧类型文件未删除（死代码）
- 暗色模式未适配

---

## 常用命令

```bash
# 本地开发
cd E:\CODE-work\my-learning-notes-app
npm run dev          # 启动 → http://localhost:3000

# 构建检查
npm run build

# 推送部署
git add -A
git commit -m "描述改动"
git push            # Cloudflare Pages 自动部署
```

---

## 重要链接

- **Supabase 控制台**: https://supabase.com/dashboard/project/jeyetxtnoucrvgyzuwxw
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **GitHub 仓库**: https://github.com/hizyt419-tech/ai-native-engineer-work

---

## 文件结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局 + 底部导航
│   ├── page.tsx            # 工作台主页
│   ├── globals.css         # 全局样式 + 设计系统变量
│   ├── dashboard/page.tsx  # 看板（占位）
│   ├── notes/page.tsx      # 笔记（占位，未持久化）
│   └── library/page.tsx    # 清单（占位，未持久化）
├── components/
│   ├── BottomNav.tsx       # 底部 4 Tab 导航
│   ├── Board.tsx           # 当日面板容器
│   ├── Section.tsx         # 单个板块
│   ├── TaskItem.tsx        # 任务行
│   ├── Timer.tsx           # 计时器
│   ├── Calendar.tsx        # 月视图日历
│   └── SummaryPanel.tsx    # 今日总结
├── lib/
│   ├── supabaseClient.ts   # Supabase 客户端（懒加载）
│   └── boardDb.ts          # 数据库 CRUD
└── types/
    └── board.ts            # 类型定义 + 板块配置
```
