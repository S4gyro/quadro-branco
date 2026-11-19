import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Image as ImageIcon, Video, Mic } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, items, onSelectItem }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = (item.title || '').toLowerCase().includes(q);
    const contentMatch = item.type === 'text' && (item.content || '').toLowerCase().includes(q);
    return titleMatch || contentMatch;
  });

  const typeIcon = (type) => {
    if (type === 'image') return <ImageIcon size={15} className="text-blue-500 flex-shrink-0" />;
    if (type === 'video') return <Video size={15} className="text-purple-500 flex-shrink-0" />;
    if (type === 'audio') return <Mic size={15} className="text-green-500 flex-shrink-0" />;
    return <FileText size={15} className="text-yellow-600 flex-shrink-0" />;
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-16 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou texto..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-800"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-2 overflow-y-auto flex-1 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">Nenhum item encontrado.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition"
              >
                {typeIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {item.title || (item.type === 'text' ? item.content?.slice(0, 30) : '') || `Sem título (${item.type})`}
                  </div>
                  {item.type === 'text' && item.title && item.content && (
                    <div className="text-xs text-gray-400 truncate">{item.content}</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}