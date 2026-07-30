"use client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 pt-6">
        {/* 页面标题 */}
        <div className="card p-5 mb-4">
          <h1 className="text-lg font-bold text-warm-800 flex items-center gap-2">
            📊 数据看板
          </h1>
          <p className="text-sm text-warm-400 mt-1">数据统计、收入趋势、周报月报</p>
        </div>

        {/* 占位卡片组 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "本周兼职", value: "—", icon: "💰", color: "bg-mustard-bg" },
            { label: "本周运动", value: "—", icon: "🏃", color: "bg-sage-bg" },
            { label: "本月收入", value: "—", icon: "📈", color: "bg-rose-bg" },
            { label: "完成率", value: "—", icon: "✅", color: "bg-sky-bg" },
          ].map((stat, i) => (
            <div key={i} className={`card p-4 ${stat.color}`}>
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-xl font-bold text-warm-800">{stat.value}</p>
              <p className="text-xs text-warm-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 周报区域 */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-warm-800 text-base flex items-center gap-2 mb-3">
            📋 本周回顾
          </h2>
          <p className="text-sm text-warm-400 leading-relaxed">
            自动汇总每日记录，生成周报。记录一周数据后这里会自动填充。
          </p>
          <div className="mt-3 h-32 rounded-xl bg-cream flex items-center justify-center border border-dashed border-warm-border">
            <p className="text-sm text-warm-400/60">本周数据不足，继续记录吧 ✨</p>
          </div>
        </div>

        {/* 收入趋势 */}
        <div className="card p-5">
          <h2 className="font-semibold text-warm-800 text-base flex items-center gap-2 mb-3">
            💰 收入趋势
          </h2>
          <p className="text-sm text-warm-400 leading-relaxed">
            兼职收入统计和时间分析将在这里展示。
          </p>
          <div className="mt-3 h-32 rounded-xl bg-cream flex items-center justify-center border border-dashed border-warm-border">
            <p className="text-sm text-warm-400/60">积累更多数据后生成趋势图 📊</p>
          </div>
        </div>
      </div>
    </div>
  );
}
