import { motion } from 'framer-motion';

export default function BattleCard({ song, album, onSelect }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="cursor-pointer p-4 border rounded flex flex-col items-center"
      onClick={() => onSelect(song)}
    >
      <img src={album.cover || ''} alt={song.name} className="w-32 h-32 object-cover mb-2" />
      <p className="text-center font-semibold">{song.name}</p>
    </motion.div>
  );
}
