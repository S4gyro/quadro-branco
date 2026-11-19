import { Trash2, FolderInput, X } from 'lucide-react';

export default function SelectionBar({
  selectedCount,
  projects,
  activeProjectId,
  onMoveToProject,
  onDeleteSelected,
  onClear,
}) {
  if (selectedCount === 0) return null;
  const otherProjects = projects.filter((p) => p.id !== activeProjectId);

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-blue-200 flex items-center gap-2.5 flex-wrap justify-center max-w-[92vw]"
    >
      <span className="text-xs md:text-sm font-bold text-blue-600 px-1">
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>

      {otherProjects.length > 0 && (
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
          <FolderInput size={15} className="text-gray-500" />
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onMoveToProject(e.target.value);
                e.target.value = '';
              }
            }}
            className="text-xs bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
          >
            <option value="" disabled>Mover para...</option>
            {otherProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={onDeleteSelected}
        className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl transition"
      >
        <Trash2 size={14} /> Excluir
      </button>

      <button
        onClick={onClear}
        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
        title="Limpar seleção"
      >
        <X size={16} />
      </button>
    </div>
  );
}