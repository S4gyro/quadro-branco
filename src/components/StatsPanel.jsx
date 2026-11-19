import { useState, useEffect } from 'react';
import { BarChart3, ChevronDown, FileText, Image as ImageIcon, Video, Mic } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function StatsPanel({ items, trashItems, connections }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    itemSizes: [],
    counts: { text: 0, image: 0, video: 0, audio: 0 },
    itemsTotal: 0,
    trashTotal: 0,
    grandTotal: 0,
  });

  // Só recalcula 600ms após parar de mexer (elimina o lag no celular)
  useEffect(() => {
    const timer = setTimeout(() => {
      const itemSizes = items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title || (item.type === 'text' ? item.content?.slice(0, 20) : '') || `Sem título (${item.type})`,
        size: new Blob([JSON.stringify(item)]).size,
      }));

      const itemsTotal = itemSizes.reduce((acc, i) => acc + i.size, 0);
      const trashTotal = new Blob([JSON.stringify(trashItems)]).size;
      const connsTotal = new Blob([JSON.stringify(connections)]).size;

      setStats({
        itemSizes: itemSizes.sort((a, b) => b.size - a.size),
        counts: {
          text: items.filter((i) => i.type === 'text').length,
          image: items.filter((i) => i.type === 'image').length,
          video: items.filter((i) => i.type === 'video').length,
          audio: items.filter((i) => i.type === 'audio').length,
        },
        itemsTotal,
        trashTotal,
        grandTotal: itemsTotal + trashTotal + connsTotal,
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [items, trashItems, connections]);

  const typeIcon = (type) => {
    if (type === 'image') return <ImageIcon size={13} className="text-blue-500" />;
    if (type === 'video') return <Video size={13} className="text-purple-500" />;
    if (type === 'audio') return <Mic size={13} className="text-green-500" />;
    return <FileText size={13} className="text-yellow-600" />;
  };

  return (
    <div
      className="absolute top-3 right-3 md:top-4 md:right-6 z-50 flex flex-col items-end"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition text-gray-700 text-xs font-semibold"
        title="Informações técnicas do quadro"
      >
        <BarChart3 size={16} className="text-blue-500" />
        <span>{formatBytes(stats.grandTotal)}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-3.5 w-72 text-xs text-gray-700 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
              <div className="text-gray-400 text-[11px]">Itens no quadro</div>
              <div className="text-base font-bold text-gray-800">{items.length}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
              <div className="text-gray-400 text-[11px]">Peso total</div>
              <div className="text-base font-bold text-blue-600">{formatBytes(stats.grandTotal)}</div>
            </div>
          </div>

          <div className="flex justify-between bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100 text-[11px] font-medium">
            <span>📝 {stats.counts.text}</span>
            <span>📷 {stats.counts.image}</span>
            <span>🎬 {stats.counts.video}</span>
            <span>🎵 {stats.counts.audio}</span>
            <span>🔗 {connections.length}</span>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-gray-400 mb-1.5 flex justify-between">
              <span>Elementos (maior → menor)</span>
              <span>{formatBytes(stats.itemsTotal)}</span>
            </div>
            <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
              {stats.itemSizes.length === 0 ? (
                <div className="text-center text-gray-400 py-3">Quadro vazio</div>
              ) : (
                stats.itemSizes.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded-lg">
                    <div className="flex items-center gap-1.5 truncate max-w-[165px]">
                      {typeIcon(item.type)}
                      <span className="truncate">{item.title}</span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-gray-600">
                      {formatBytes(item.size)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {trashItems.length > 0 && (
            <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-2 flex justify-between">
              <span>Lixeira ({trashItems.length} itens)</span>
              <span className="font-mono">{formatBytes(stats.trashTotal)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}