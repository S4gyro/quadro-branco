import { Trash2, X } from 'lucide-react';

const COLORS = ['#60a5fa', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#6b7280'];

export default function ConnectionBar({ connection, onUpdate, onDelete, onClose }) {
  if (!connection) return null;

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-2 flex-wrap justify-center max-w-[92vw]"
    >
      <input
        type="text"
        value={connection.label || ''}
        onChange={(e) => onUpdate(connection.id, { label: e.target.value })}
        placeholder="Nome da conexão..."
        className="text-xs md:text-sm bg-gray-100 px-2.5 py-1.5 rounded-lg outline-none text-gray-800 w-36 md:w-44"
      />

      <div className="flex items-center gap-1.5 px-1">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onUpdate(connection.id, { color })}
            className={`w-5 h-5 rounded-full transition-transform ${
              (connection.color || '#60a5fa') === color ? 'scale-125 ring-2 ring-gray-400' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <button
        onClick={() => onUpdate(connection.id, { dashed: !connection.dashed })}
        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border ${
          connection.dashed ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}
      >
        {connection.dashed ? 'Tracejada' : 'Contínua'}
      </button>

      <button
        onClick={() => onDelete(connection.id)}
        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
        title="Excluir conexão"
      >
        <Trash2 size={16} />
      </button>

      <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
        <X size={16} />
      </button>
    </div>
  );
}