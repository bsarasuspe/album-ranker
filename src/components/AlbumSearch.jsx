import { useState, useEffect } from 'react';

export default function AlbumSearch({ onSelectAlbum }) {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [tracks, setTracks] = useState([]); // estado para canciones
  const [loading, setLoading] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Debounce manual para buscar álbumes
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.albums || []);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Cuando se selecciona un álbum
  const handleSelect = async (album) => {
    onSelectAlbum(album);
    setQuery(album.name);
    setSuggestions([]);

    // Cargar canciones del álbum
    setLoadingTracks(true);
    try {
      const res = await fetch(`/api/spotify-tracks?albumId=${album.id}`);
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (err) {
      console.error('Error fetching tracks:', err);
      setTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca un álbum..."
        className="border p-2 rounded w-full"
      />
      {loading && <p className="text-sm text-gray-500 mt-1">Buscando...</p>}

      {/* Sugerencias */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
          {suggestions.map(album => (
            <div
              key={album.id}
              onClick={() => handleSelect(album)}
              className="cursor-pointer p-2 hover:bg-blue-100 flex items-center gap-2"
            >
              <img src={album.cover} alt={album.name} className="w-10 h-10 object-cover rounded"/>
              <div>
                <p className="text-sm font-semibold">{album.name}</p>
                <p className="text-xs text-gray-500">{album.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de canciones */}
      {loadingTracks && <p className="mt-2 text-gray-500 text-sm">Cargando canciones...</p>}
      {tracks.length > 0 && (
        <ul className="mt-4 border rounded p-2 max-h-64 overflow-y-auto">
          {tracks.map(track => (
            <li key={track.id} className="py-1 border-b last:border-b-0">
              {track.name} <span className="text-xs text-gray-500">({track.artists})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
