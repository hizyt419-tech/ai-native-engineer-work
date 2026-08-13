interface BookResult {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  year?: string;
  thumbnail?: string;
}

const FETCH_TIMEOUT_MS = 8_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function searchGoogle(q: string, apiKey?: string): Promise<BookResult[]> {
  const url =
    "https://www.googleapis.com/books/v1/volumes?q=" +
    encodeURIComponent(q) +
    "&country=CN&maxResults=8" +
    (apiKey ? `&key=${encodeURIComponent(apiKey)}` : "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: any = await res.json();
    return (data.items || [])
      .map((it: any) => {
        const v = it.volumeInfo || {};
        return {
          id: String(it.id || Math.random()),
          title: String(v.title || "").trim(),
          authors: Array.isArray(v.authors) ? v.authors.map(String) : [],
          publisher: v.publisher ? String(v.publisher) : undefined,
          year: v.publishedDate ? String(v.publishedDate).slice(0, 4) : undefined,
          thumbnail: v.imageLinks?.thumbnail,
        };
      })
      .filter((b: BookResult) => b.title.length > 0);
  } finally {
    clearTimeout(timer);
  }
}

async function searchOpenLibrary(q: string): Promise<BookResult[]> {
  const url = "https://openlibrary.org/search.json?q=" + encodeURIComponent(q) + "&limit=8";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: any = await res.json();
    return (data.docs || [])
      .map((d: any) => ({
        id: String(d.key || Math.random()),
        title: String(d.title || "").trim(),
        authors: Array.isArray(d.author_name) ? d.author_name.map(String) : [],
        publisher: Array.isArray(d.publisher) ? String(d.publisher[0]) : d.publisher ? String(d.publisher) : undefined,
        year: d.first_publish_year ? String(d.first_publish_year) : undefined,
        thumbnail: d.cover_i
          ? `https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg`
          : undefined,
      }))
      .filter((b: BookResult) => b.title.length > 0);
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequestGet(context: {
  request: Request;
  env: { GOOGLE_BOOKS_API_KEY?: string };
}): Promise<Response> {
  const url = new URL(context.request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 50);
  if (!q) return json({ items: [] });

  try {
    let items: BookResult[] = [];
    try {
      items = await searchGoogle(q, context.env.GOOGLE_BOOKS_API_KEY);
    } catch {
      items = [];
    }
    if (items.length === 0) {
      items = await searchOpenLibrary(q);
    }
    return json({ items });
  } catch {
    return json({ items: [], error: "书目检索暂时不可用，请稍后重试" }, 502);
  }
}
