import html2canvas from 'html2canvas';

export default function Ranking({ rankedSongs }) {
  const generateImage = () => {
    const rankingDiv = document.getElementById('ranking');
    html2canvas(rankingDiv).then(canvas => {
      const link = document.createElement('a');
      link.download = 'ranking.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div id="ranking" className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Tu ranking</h2>
        <ol className="list-decimal pl-5 space-y-2">
          {rankedSongs.map((song, index) => <li key={index}>{song.name}</li>)}
        </ol>
      </div>
      <button onClick={generateImage} className="mt-4 bg-green-500 text-white p-2 rounded w-full">
        Descargar imagen
      </button>
    </div>
  );
}
