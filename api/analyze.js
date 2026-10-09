
import { askNexray, sendJson, readBody } from "./_nexray.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Gunakan POST." });
  }

  try {
    const body = await readBody(req);
    const text = String(body.text || "").trim();
    const action = String(body.action || "ringkas");

    if (!text) {
      return sendJson(res, 400, { error: "Teks masih kosong." });
    }

    const tasks = {
      ringkas: "Ringkas isi berikut dalam bahasa Indonesia.",
      jelaskan: "Jelaskan isi berikut dengan bahasa sederhana.",
      poin: "Tuliskan poin-poin penting dari isi berikut.",
      soal: "Buat lima soal latihan berdasarkan isi berikut beserta kunci jawaban."
    };

    const prompt = (tasks[action] || tasks.ringkas) +
      "\n\nBahan:\n" + text;

    const answer = await askNexray(prompt);
    return sendJson(res, 200, { answer });
  } catch (error) {
    return sendJson(res, 502, {
      error: error.message || "Gagal menganalisis teks."
    });
  }
    }
