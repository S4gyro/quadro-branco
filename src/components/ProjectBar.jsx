import { useState, useRef } from 'react';
import { FolderKanban, ChevronDown, Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';

export default function ProjectBar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const importInputRef = useRef(null);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <div
      className="absolute top-3 left-3 md:top-4 md:left-6 z-50"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition text-gray-800 font-semibold text-sm max-w-[220px]"
      >
        <FolderKanban size={18} className="text-blue-500 flex-shrink-0" />
        <span className="truncate">{activeProject?.name || 'Quadro'}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <input
        type="file"
        accept=".json"
        ref={importInputRef}
        onChange={(e) => {
          onImportProject(e.target.files[0]);
          e.target.value = null;
          setIsOpen(false);
        }}
        className="hidden"
      />

      {isOpen && (
        <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-64 flex flex-col gap-1">
          <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
            {projects.map((project) => {
              const isActive = project.id === activeProjectId;
              return (
                <div
                  key={project.id}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                    isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectProject(project.id);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left text-sm truncate pr-2"
                  >
                    {project.name}
                  </button>

                  <div className="flex items-center gap-1">
                    <button onClick={() => onRenameProject(project.id)} className="p-1 text-gray-400 hover:text-blue-600 rounded-md" title="Renomear">
                      <Pencil size={14} />
                    </button>
                    {projects.length > 1 && (
                      <button onClick={() => onDeleteProject(project.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-md" title="Excluir quadro">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full h-px bg-gray-100 my-1" />

          <button
            onClick={() => {
              onCreateProject();
              setIsOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100 rounded-xl transition"
          >
            <Plus size={16} /> Novo quadro
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => {
                onExportProject();
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              title="Baixar backup deste quadro"
            >
              <Download size={14} /> Exportar
            </button>
            <button
              onClick={() => importInputRef.current.click()}
              className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              title="Carregar backup (.json)"
            >
              <Upload size={14} /> Importar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}