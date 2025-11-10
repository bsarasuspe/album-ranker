import fetch from "node-fetch";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.status(500).json({ error: "No SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in env" });
    return;
  }

  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const token = await getSpotifyToken();

    const searchUrl = new URL('https://api.spotify.com/v1/search');
    searchUrl.search = new URLSearchParams({ q, type: 'album', limit: 10 }).toString();

    const searchRes = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!searchRes.ok) {
      const text = await searchRes.text();
      console.error('Spotify search error:', searchRes.status, text);
      res.status(500).json({ error: 'Failed to fetch Spotify', status: searchRes.status, details: text });
      return;
    }

    const searchData = await searchRes.json();

    // Filtrar solo álbumes (descartar singles)
    const albums = (searchData.albums.items || [])
      .filter(album => album.album_type === "album" || album.album_type === "compilation")
      .map(album => ({
        id: album.id,
        name: album.name,
        artist: album.artists.map(a => a.name).join(', '),
        cover: album.images[0]?.url || '',
      }));

    res.status(200).json({ albums });
  } catch (err) {
    console.error('Function crashed:', err);
    res.status(500).json({ error: 'Failed to fetch Spotify', details: err.message });
  }
}
