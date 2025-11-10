import { useState, useEffect } from 'react';
import BattleCard from './BattleCard';

export default function BattleScreen({ album, onFinish }) {
  const [tracks, setTracks] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!album?.id) return;
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify-tracks?albumId=${album.id}`);
        const data = await res.json();
        setTracks(data.tracks || []);
      } catch {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [album]);

  useEffect(() => {
    if (tracks.length >= 2) pickNextPair();
  }, [tracks]);

  const pickNextPair = () => {
    // Selecciona dos canciones aleatorias
    const remaining = tracks.filter(t => t);
    if (remaining.length < 2) {
      // Terminamos
      const ranked = [...tracks].sort((a,b) => (scores[b.id]||0) - (scores[a.id]||0));
      onFinish(ranked);
      return;
    }
    const [first, second] = remaining.sort(() => Math.random() - 0.5).slice(0,2);
    setCurrentPair([first, second]);
  };

  const handleSelect = (winner) => {
    setScores(prev => ({ ...prev, [winner.id]: (prev[winner.id]||0) + 1 }));
    pickNextPair();
  };

  if (loading) return <p className="text-center mt-10">Cargando canciones...</p>;
  if (!currentPair || currentPair.length < 2) return <p className="text-center mt-10">No hay suficientes canciones para la batalla</p>;

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col items-center space-y-4">
      <div className="flex gap-4">
        {currentPair.map(song => (
          <BattleCard key={song.id} song={song} album={album} onSelect={handleSelect} />
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {Object.values(scores).reduce((a,b) => a+b,0)} comparaciones realizadas
      </p>
    </div>
  );
}
