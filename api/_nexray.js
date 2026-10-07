const DEFAULT_NEXRAY_URL = "https://api.nexray.eu.cc/ai/chatgpt";

export async function askNexray(text) {
  const base = process.env.NEXRAY_API_URL || DEFAULT_NEXRAY_URL;
  const url = `${base}?text=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json, text/plain, */*"
    }
  });

  const raw = await response.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Nexray HTTP ${response.status}`
    );
  }

  const result =
    data?.result ??
    data?.response ??
    data?.answer ??
    raw;

  if (typeof result !== "string" || !result.trim()) {
    throw new Error(
      "Nexray tidak mengembalikan hasil AI yang bisa dibaca."
    );
  }

  return result.trim();
}

export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
        }
