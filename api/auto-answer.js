
import { askNexray, sendJson, readBody } from "./_nexray.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Gunakan POST." });
  }

  try {
    const body = await readBody(req);
    const question = String(body.question || "").trim();
    const options = Array.isArray(body.options) ? body.options : [];

    if (!question || options.length < 2) {
      return sendJson(res, 400, {
        error: "Masukkan soal dan minimal dua opsi."
      });
    }

    const prompt =
      "Jawab soal pilihan ganda berikut dalam bahasa Indonesia. " +
      "Sebutkan opsi paling tepat dan alasan singkat. " +
      "Jika informasi kurang, jelaskan ketidakpastiannya.\n\n" +
      "Soal: " + question + "\n" +
      "Pilihan:\n" + options.join("\n");

    const answer = await askNexray(prompt);
    return sendJson(res, 200, { answer });
  } catch (error) {
    return sendJson(res, 502, {
      error: error.message || "Gagal menghubungi Nexray."
    });
  }
}
