try {
  const url = new URL('https://api.genius.com/search');
  url.search = new URLSearchParams({ q }).toString();

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Genius API Error:', response.status, text);
    return res.status(500).json({ error: 'Failed to fetch Genius', status: response.status, details: text });
  }

  const data = await response.json();
  const hits = data.response.hits || [];

  const albums = hits
    .filter(hit => hit.result.album)
    .map(hit => ({
      id: hit.result.album.id,
      name: hit.result.album.name,
      cover: hit.result.album_cover_art_url || hit.result.song_art_image_url,
    }));

  res.status(200).json({ albums });
} catch (err) {
  console.error('Function crashed:', err);
  res.status(500).json({ error: 'Failed to fetch Genius', details: err.message });
}
