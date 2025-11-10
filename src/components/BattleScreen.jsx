import { useState, useEffect } from 'react';
import BattleCard from './BattleCard';

export default function BattleScreen({ album, onFinish }) {
  const [tracks, setTracks] = useState([]);
  const [pairs, setPairs] = useState([]); // todas las combinaciones posibles
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);

  // Traer tracks del álbum desde la API
  useEffect(() => {
    if (!album?.id) return;

    const fetchTracks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify-tracks?albumId=${album.id}`);
        const data = await res.json();
        setTracks(data.tracks || []);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [album]);

  // Generar todas las combinaciones posibles de pares
  useEffect(() => {
    if (tracks.length < 2) return;

    const allPairs = [];
    for (let i = 0; i < tracks.length; i++) {
      for (let j = i + 1; j < tracks.length; j++) {
        allPairs.push([tracks[i], tracks[j]]);
      }
    }

    // Mezclar aleatoriamente los pares
    setPairs(allPairs.sort(() => Math.random() - 0.5));
    setCurrentPairIndex(0);
    setScores({});
  }, [tracks]);

  // Manejar selección de canción
  const handleSelect = (song) => {
    // Sumar un punto al ganador
    setScores(prev => ({ ...prev, [song.id]: (prev[song.id] || 0) + 1 }));

    const nextIndex = currentPairIndex + 1;

    if (nextIndex >= pairs.length) {
      // Se terminaron todas las comparaciones: generar ranking
      const ranked = [...tracks].sort(
        (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
      );
      onFinish(ranked);
    } else {
      setCurrentPairIndex(nextIndex);
    }
  };

  if (loading || pairs.length === 0) return <p className="text-center mt-10">Cargando canciones...</p>;

  const [first, second] = pairs[currentPairIndex];

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col items-center space-y-4">
      <div className="flex gap-4">
        <BattleCard key={first.id} song={first} album={album} onSelect={handleSelect} />
        <BattleCard key={second.id} song={second} album={album} onSelect={handleSelect} />
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Comparación {currentPairIndex + 1} de {pairs.length}
      </p>
    </div>
  );
}
