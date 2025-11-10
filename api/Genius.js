const GENIUS_TOKEN = 'xSHufZJSYYDyd0oYdzpufuO-5zclj1EI-3qYhspib1KdYKNcHuE_BAgXeiY8fVi6';
const BASE_URL = 'https://api.genius.com';

async function request(path, params = {}) {
  const url = new URL(BASE_URL + path);
  url.search = new URLSearchParams(params).toString();
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${GENIUS_TOKEN}`,
    },
  });
  const data = await res.json();
  return data.response;
}

export async function searchAlbum(query) {
  const resp = await request('/search', { q: query });
  const hits = resp.hits || [];
  // Filtrar hits que tengan álbum
  const albums = hits
    .filter(hit => hit.result.album)
    .map(hit => ({
      id: hit.result.album.id,
      name: hit.result.album.name,
      cover: hit.result.album_cover_art_url || hit.result.song_art_image_url,
    }));
  return albums;
}

export async function getAlbumTracks(albumId) {
  const resp = await request(`/albums/${albumId}/tracks`, { per_page: 50 });
  const tracks = resp.tracks || resp.items || [];
  return tracks.map(track => ({
    id: track.id,
    name: track.title,
    album: {
      images: [
        { url: track.song_art_image_url || track.album_cover_art_url }
      ]
    }
  }));
}
