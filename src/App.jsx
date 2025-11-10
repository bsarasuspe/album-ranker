import { useState } from 'react';
import Header from './components/Header';
import AlbumSearch from './components/AlbumSearch';
import BattleScreen from './components/BattleScreen';
import Ranking from './components/Ranking';

export default function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [ranking, setRanking] = useState(null);

  const handleFinish = (tracks, scores) => {
    const rankedSongs = [...tracks].sort((a,b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    setRanking(rankedSongs);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Header />
      {!selectedAlbum && <AlbumSearch onSelectAlbum={setSelectedAlbum} />}
      {selectedAlbum && !ranking && <BattleScreen album={selectedAlbum} onFinish={handleFinish} />}
      {ranking && <Ranking rankedSongs={ranking} />}
    </div>
  );
}
