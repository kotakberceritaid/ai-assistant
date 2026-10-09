
import { askNexray, sendJson, readBody } from "./_nexray.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Gunakan POST." });
  }

  try {
    const body = await readBody(req);
    const text = String(body.text || "").trim();

    if (!text) {
      return sendJson(res, 400, { error: "Pesan masih kosong." });
    }

    const answer = await askNexray(text);
    return sendJson(res, 200, { answer });
  } catch (error) {
    return sendJson(res, 502, {
      error: error.message || "Gagal menghubungi Nexray."
    });
  }
}
