import { askNexray, cors } from "./_nexray.js";

function extractJson(raw) {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error("AI tidak mengembalikan JSON yang valid.");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method harus POST." });

  try {
    const { questions = [], url = "" } = req.body || {};
    if (!Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ error: "Questions kosong." });
    }

    const prompt = `Kamu membantu menguji Google Form milik pengguna.
URL: ${url}
Berikut daftar pertanyaan dan opsi:
${JSON.stringify(questions, null, 2)}

Pilih opsi terbaik berdasarkan pertanyaan. Kembalikan HANYA JSON valid dengan format:
{"answers":[{"index":0,"option":"teks opsi"}]}
Satu entry per pertanyaan yang bisa dijawab. Jangan menambahkan markdown atau komentar.`;

    const raw = await askNexray(
      `${prompt}\n\nPenting: output HARUS JSON valid saja, tanpa kalimat pembuka atau penutup.`
    );
    const parsed = extractJson(raw);
    if (!Array.isArray(parsed.answers)) parsed.answers = [];

    res.status(200).json(parsed);
  } catch (e) {
    res.status(502).json({ error: e.message || "Gagal memproses jawaban dari Nexray." });
  }
}
