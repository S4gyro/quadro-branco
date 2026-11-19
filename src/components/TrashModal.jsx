import { Trash2, RotateCcw, X } from 'lucide-react';

export default function TrashModal({ isOpen, onClose, trashItems, onRestore, onEmptyTrash }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-gray-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Trash2 size={20} className="text-red-500" /> Lixeira
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 transition p-1.5 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto bg-white">
          {trashItems.length === 0 ? (
            <div className="text-center py-10">
              <Trash2 size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">Sua lixeira está vazia.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {trashItems.map((item) => (
                <li
                  key={item.id}
                  className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex justify-between items-center group hover:border-gray-300 transition shadow-sm"
                >
                  <span className="truncate text-gray-700 max-w-[180px] text-sm font-semibold">
                    {item.type === 'image' && `📷 ${item.title || 'Imagem'}`}
                    {item.type === 'video' && `🎬 ${item.title || 'Vídeo'}`}
                    {item.type === 'audio' && `🎵 ${item.title || 'Áudio'}`}
                    {item.type === 'text' && (item.title || item.content || '(Anotação vazia)')}
                  </span>
                  <button
                    onClick={() => onRestore(item.id)}
                    className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition font-medium border border-blue-100"
                  >
                    <RotateCcw size={14} /> Restaurar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {trashItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={onEmptyTrash}
              className="w-full py-3 bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 rounded-xl transition shadow-sm"
            >
              Esvaziar lixeira permanentemente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}