import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  const { artist, album } = req.query;
  if (!artist || !album) return res.status(400).json({ error: "artist & album required" });

  try {
    const slug = (text) =>
      encodeURIComponent(
        text
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9\s-']/g, "")
          .replace(/\s+/g, "-")
      );

    const url = `https://genius.com/albums/${slug(artist)}/${slug(album)}`;
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error("Failed to fetch genius");

    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const nodes = Array.from(doc.querySelectorAll(".chart_row-content-title, .tracklist_row-header-content-title"));
    const tracks = nodes.map((n) => n.textContent.replace(/\s*Lyrics\s*$/i, "").trim()).filter(Boolean);

    res.status(200).json({ tracks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}
