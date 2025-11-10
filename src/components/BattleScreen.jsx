import { useState, useEffect } from 'react';
import BattleCard from './BattleCard';

export default function BattleScreen({ album, onFinish }) {
  const [tracks, setTracks] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);

  // Traer tracks desde la API de Spotify
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

  // Generar primer par cuando tracks >= 2
  useEffect(() => {
    if (tracks.length >= 2) generatePair();
  }, [tracks]);

  const shuffle = (array) => (array || []).sort(() => Math.random() - 0.5);

  const generatePair = () => {
    if (!tracks || tracks.length < 2) {
      onFinish(tracks, scores);
      setCurrentPair([]);
      return;
    }
    const [first, second, ...rest] = shuffle(tracks);
    setCurrentPair([first, second]);
    setTracks(rest);
  };

  const handleSelect = (song) => {
    if (!song) return;
    setScores((prev) => ({ ...prev, [song.id]: (prev[song.id] || 0) + 1 }));
    generatePair();
  };

  if (loading) return <p className="text-center mt-10">Cargando canciones...</p>;
  if (!currentPair || currentPair.length !== 2)
    return <p className="text-center mt-10">No hay suficientes canciones para la batalla</p>;

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col items-center space-y-4">
      <div className="flex gap-4">
        {currentPair.map((song) => (
          <BattleCard key={song.id} song={song} album={album} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
