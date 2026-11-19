import { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export default function AudioPlayer({ src }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [peaks, setPeaks] = useState([]);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  // Lê o áudio e calcula os pontos de pico (volume alto/baixo)
  useEffect(() => {
    let active = true;
    const generateWaveform = async () => {
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const rawData = audioBuffer.getChannelData(0);
        
        const samples = 35; // Quantidade de barrinhas
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          filteredData.push(sum / blockSize);
        }
        
        const max = Math.max(...filteredData) || 1;
        if (active) setPeaks(filteredData.map(n => Math.max((n / max) * 100, 15)));
        audioCtx.close();
      } catch (err) {
        // Fallback visual caso o navegador não decodifique o formato
        if (active) setPeaks(Array(35).fill(30));
      }
    };
    generateWaveform();
    return () => { active = false; };
  }, [src]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e, index) => {
    e.stopPropagation();
    if (!audioRef.current || !audioRef.current.duration) return;
    const newTime = (index / peaks.length) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
  };

  return (
    <div 
      className="flex items-center gap-3 w-full bg-gray-50 p-2 rounded-xl border border-gray-200"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button 
        onClick={togglePlay}
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-sm"
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Barras de Pico */}
      <div className="flex items-center justify-between flex-1 h-10 gap-[2px] cursor-pointer">
        {peaks.map((height, i) => {
          const isPlayed = (i / peaks.length) * 100 <= progress;
          return (
            <div
              key={i}
              onClick={(e) => handleSeek(e, i)}
              className={`flex-1 rounded-full transition-colors ${isPlayed ? 'bg-blue-500' : 'bg-gray-300'}`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => {
          const { currentTime, duration } = e.target;
          if (duration) setProgress((currentTime / duration) * 100);
        }}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        className="hidden"
      />
    </div>
  );
}