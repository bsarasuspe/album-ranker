import fetch from "node-fetch";

export default async function handler(req, res) {
  const token = process.env.GENIUS_TOKEN;
  if (!token) {
    res.status(500).json({ error: "No GENIUS_TOKEN set in environment variables" });
    return;
  }

  const { albumId } = req.query;
  if (!albumId) {
    res.status(400).json({ error: "Query parameter 'albumId' is required" });
    return;
  }

  try {
    const url = new URL(`https://api.genius.com/albums/${albumId}/tracks`);
    url.search = new URLSearchParams({ per_page: 50 }).toString();

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Genius Tracks API Error:', response.status, text);
      res.status(500).json({ error: 'Failed to fetch Genius tracks', status: response.status, details: text });
      return;
    }

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
    console.error('Function crashed:', err);
    res.status(500).json({ error: 'Failed to fetch Genius tracks', details: err.message });
  }
}
