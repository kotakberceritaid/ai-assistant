import { askNexray, cors } from "./_nexray.js";

function prompt(action, text, url) {
  const base = `Kamu adalah AI assistant untuk halaman web yang dimiliki atau diotorisasi pengguna.

URL:
${url}

Isi halaman:
${text}`;

  if (action === "summary") {
    return `${base}

Ringkas isi halaman secara jelas dan singkat.`;
  }

  if (action === "options") {
    return `${base}

Jelaskan pertanyaan dan opsi yang terlihat.
Jangan mengirim atau mensubmit jawaban ke situs.`;
  }

  if (action === "chat") {
    return `${base}

Berikan ringkasan konteks halaman dan jawablah berdasarkan konten yang tersedia.`;
  }

  return `${base}

Analisis halaman dan jelaskan soal/materi yang ditemukan.
Untuk latihan, berikan pembahasan dan alasan jawaban.`;
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method harus POST."
    });
  }

  try {
    const {
      action = "analyze",
      text = "",
      url = ""
    } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Page text kosong."
      });
    }

    const answer = await askNexray(
      `${prompt(action, text, url)}

Jawab dalam Bahasa Indonesia.
Jangan mengaku telah melakukan tindakan yang tidak dilakukan.`
    );

    res.status(200).json({
      answer
    });

  } catch (e) {
    res.status(502).json({
      error: e.message || "Gagal menghubungi Nexray."
    });
  }
}
