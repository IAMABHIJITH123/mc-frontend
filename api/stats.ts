import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch("http://se-mlm-01.velrix.net:4819/stats"); // ⚠️ IMPORTANT: /stats not /api/stats
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Backend fetch failed" });
  }
}
