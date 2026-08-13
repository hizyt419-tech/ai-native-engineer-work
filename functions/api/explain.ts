interface Env {
  DEEPSEEK_API_KEY?: string;
}

const SYSTEM_PROMPT =
  "你是一名耐心的中文新闻解读助手。用户会给你一条新闻里的句子或关键词，请你用通俗易懂的中文解释：1) 它是什么；2) 出现在什么场景/新闻里；3) 对相关从业者和普通人分别有什么意义或引申影响。控制在 200 字以内，用简短分点，不要空话。";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const body: any = await context.request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 500) : "";
  if (!text) return json({ error: "请输入要解读的内容" }, 400);

  const apiKey = context.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return json({
      text: "AI 解读还没启用：请在 Cloudflare Pages 后台的「设置 → 环境变量」添加 DEEPSEEK_API_KEY，保存后重新部署即可使用。",
      needsSetup: true,
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      return json({ error: `AI 服务返回错误（${res.status}），请稍后重试` }, 502);
    }
    const data: any = await res.json();
    const out = data?.choices?.[0]?.message?.content?.trim();
    if (!out) return json({ error: "AI 没有返回内容，请稍后重试" }, 502);
    return json({ text: out });
  } catch {
    return json({ error: "AI 解读服务暂时不可用，请稍后重试" }, 502);
  } finally {
    clearTimeout(timer);
  }
}
