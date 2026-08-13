# 每日工作台 — 开发日志

> 最后更新：2026-08-13

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

- 3 个固定板块：兼职、运动、临时事件
- 兼职板块支持计时 + 时薪算钱
- 临时事件可选计时
- 日历切换（常驻大日历，有记录打点，可切换任意日期）
- 今日总结（SummaryModal 弹窗，每日不同问题，可回顾已完成任务）
- 数据持久化到 Supabase（离线自动降级 localStorage）

### ✅ 新闻 (`/news`，2026-08-13 新增)

- 每日精选：按星期轮换主题（宏观经济/制造装备/科技前沿/能源材料/社会民生/深度观察），打破信息茧房
- 社会新闻 / 生产新闻 分类 Tab + 检索条（本地即时过滤）
- 后端 Cloudflare Pages Function 抓取 RSS（`GET /api/news`），多源并发、失败自动跳过、10 分钟缓存
- 长按/选中句子 → 操作条：📝 存笔记 / 🤖 AI 解读（DeepSeek，`POST /api/explain`）
- AI 解读结果可一键存入笔记；未配置 `DEEPSEEK_API_KEY` 时给出配置提示

### ✅ 笔记持久化（2026-08-13）

- 笔记从内存改为 localStorage 持久化（`src/lib/noteStore.ts`）
- 新闻页存的句子 / AI 解读与笔记页共用同一份数据，刷新不丢

### ✅ 底部导航

- 工作台 (`/`)
- 看板 (`/dashboard`) — 统计卡片占位
- 笔记 (`/notes`) — 快速笔记/链接/灵感（本地持久化）
- 新闻 (`/news`) — 精选新闻 + AI 解读
- 清单 (`/library`) — 书籍/电影/剧集追踪

### ✅ 数据库（Supabase）

- `daily_boards` — 每日面板
- `board_tasks` — 任务（含计时、时薪、板块）

### ✅ 部署

- Cloudflare Pages 连接 GitHub 自动部署
- 静态导出模式 (`output: "export"`)
- 环境变量已配置（Supabase）
- Pages Functions：`/api/news`、`/api/explain`（需在后台添加 `DEEPSEEK_API_KEY`）

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
- 新闻：AI 解读需在 Cloudflare Pages 后台配置 `DEEPSEEK_API_KEY` 环境变量
- 笔记/清单：接入 Supabase 持久化（笔记当前为 localStorage）
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

# 本地跑 Pages Function（含 /api/news、/api/explain）
npx wrangler pages dev out

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
│   ├── notes/page.tsx      # 笔记（localStorage 持久化）
│   ├── news/page.tsx       # 新闻（精选 + 分类 + 检索 + AI 解读）
│   └── library/page.tsx    # 清单（占位，未持久化）
├── components/
│   ├── BottomNav.tsx       # 底部 5 Tab 导航
│   ├── Board.tsx           # 当日面板容器
│   ├── Section.tsx         # 单个板块
│   ├── TaskItem.tsx        # 任务行
│   ├── Timer.tsx           # 计时器
│   ├── Calendar.tsx        # 月视图日历
│   └── SummaryPanel.tsx    # 今日总结
├── lib/
│   ├── supabaseClient.ts   # Supabase 客户端（懒加载）
│   ├── boardDb.ts          # 数据库 CRUD
│   └── noteStore.ts        # 笔记持久化（localStorage）
└── types/
    └── board.ts            # 类型定义 + 板块配置

functions/                  # Cloudflare Pages Functions（项目根目录）
├── api/
│   ├── news.ts             # 抓取新闻 RSS（GET /api/news）
│   └── explain.ts          # DeepSeek AI 解读（POST /api/explain）

news-sources.ts             # 新闻源配置（增删源改这里）
```
