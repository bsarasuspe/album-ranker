import { useState } from 'react';
import { searchAlbum } from '../api/Genius';

export default function AlbumSearch({ onSelectAlbum }) {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    const results = await searchAlbum(query);
    setAlbums(results);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca un álbum..."
        className="border p-2 rounded w-full"
      />
      <button onClick={handleSearch} className="mt-2 bg-blue-500 text-white p-2 rounded w-full">
        Buscar
      </button>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {albums.map(album => (
          <div key={album.id} onClick={() => onSelectAlbum(album)}
               className="cursor-pointer p-2 border rounded hover:shadow-lg flex flex-col items-center">
            <img src={album.cover} alt={album.name} className="w-24 h-24 object-cover mb-2"/>
            <p className="text-center font-semibold">{album.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
