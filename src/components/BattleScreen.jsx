import { useState, useEffect } from 'react';
import BattleCard from './BattleCard';
import { getAlbumTracks } from '../api/Genius';

export default function BattleScreen({ album, onFinish }) {
  const [tracks, setTracks] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    const fetchTracks = async () => {
      const songs = await getAlbumTracks(album.id);
      setTracks(songs);
    };
    fetchTracks();
  }, [album]);

  useEffect(() => {
    if (tracks.length > 0) generatePair();
  }, [tracks]);

  const generatePair = () => {
    if (tracks.length < 2) {
      onFinish(tracks, scores);
      return;
    }
    const [first, second, ...rest] = shuffle(tracks);
    setCurrentPair([first, second]);
    setTracks(rest);
  };

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const handleSelect = (song) => {
    setScores(prev => ({ ...prev, [song.id]: (prev[song.id] || 0) + 1 }));
    generatePair();
  };

  if (!currentPair || currentPair.length === 0) return <p className="text-center mt-10">Cargando canciones...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col items-center space-y-4">
      <div className="flex gap-4">
        {currentPair.map(song => <BattleCard key={song.id} song={song} onSelect={handleSelect}/>)}
      </div>
    </div>
  );
}
