import fetch from "node-fetch";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Función para obtener token de Spotify
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

  const { albumId } = req.query;
  if (!albumId) {
    res.status(400).json({ error: "Query parameter 'albumId' is required" });
    return;
  }

  try {
    const token = await getSpotifyToken();

    const url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Spotify Tracks API Error:', response.status, text);
      res.status(500).json({ error: 'Failed to fetch Spotify tracks', status: response.status, details: text });
      return;
    }

    const data = await response.json();

    const tracks = (data.items || []).map(track => ({
      id: track.id,
      name: track.name,
      preview_url: track.preview_url,  // si quieres reproducir previews
      artists: track.artists.map(a => a.name).join(', '),
      album: {
        id: albumId,
      },
    }));

    res.status(200).json({ tracks });
  } catch (err) {
    console.error('Function crashed:', err);
    res.status(500).json({ error: 'Failed to fetch Spotify tracks', details: err.message });
  }
}
