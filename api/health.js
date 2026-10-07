import { cors } from "./_nexray.js";

export default function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  res.status(200).json({
    ok: true,
    provider: "Nexray"
  });
}
