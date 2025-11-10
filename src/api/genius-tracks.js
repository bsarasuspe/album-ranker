import fetch from "node-fetch";

export default async function handler(req, res) {
  const token = process.env.GENIUS_TOKEN;
  if (!token) return res.status(500).json({ error: "No GENIUS_TOKEN" });

  const { albumId } = req.query;
  if (!albumId) return res.status(400).json({ error: "albumId required" });

  try {
    const url = new URL(`https://api.genius.com/albums/${albumId}/tracks`);
    url.search = new URLSearchParams({ per_page: 50 }).toString();

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Genius API error ' + response.status);

    const data = await response.json();
    const tracks = data.response.tracks || data.response.items || [];

    const result = tracks.map(track => ({
      id: track.id,
      name: track.title,
      album: {
        images: [
          { url: track.song_art_image_url || track.album_cover_art_url }
        ]
      }
    }));

    res.status(200).json({ tracks: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Genius tracks' });
  }
}
