
const DEFAULT_URL = "https://api.nexray.eu.cc/ai/chatgpt";

export async function askNexray(text) {
  const base = process.env.NEXRAY_API_URL || DEFAULT_URL;
  const response = await fetch(
    `${base}?text=${encodeURIComponent(text)}`
  );

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(`Nexray HTTP ${response.status}`);
  }

  const answer =
    data?.result ?? data?.response ?? data?.answer ?? raw;

  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("Jawaban dari Nexray kosong atau formatnya berubah.");
  }

  return answer.trim();
}

export function sendJson(res, status, data) {
  res.status(status).json(data);
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => raw += chunk);
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("JSON request tidak valid."));
      }
    });
    req.on("error", reject);
  });
}
