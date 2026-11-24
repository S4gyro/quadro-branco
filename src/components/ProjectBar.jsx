import { useState, useRef } from 'react';
import {
  FolderKanban,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderInput,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';

export default function ProjectBar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onCreateOrganization,
  onRenameOrganization,
  onChangeOrganization,
  onRenameProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedOrgs, setCollapsedOrgs] = useState({});
  const importInputRef = useRef(null);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Agrupa projetos por organização
  const grouped = projects.reduce((acc, proj) => {
    const org = proj.organization || 'Geral';
    if (!acc[org]) acc[org] = [];
    acc[org].push(proj);
    return acc;
  }, {});

  const orgNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const toggleOrg = (org) => {
    setCollapsedOrgs((prev) => ({ ...prev, [org]: !prev[org] }));
  };

  return (
    <div
      className="absolute top-3 left-3 md:top-4 md:left-6 z-50"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition text-gray-800 font-semibold text-sm max-w-[240px]"
      >
        <FolderKanban size={18} className="text-blue-500 flex-shrink-0" />
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[10px] font-medium text-gray-400 leading-none truncate max-w-full">
            {activeProject?.organization || 'Geral'}
          </span>
          <span className="truncate max-w-full leading-tight">
            {activeProject?.name || 'Quadro'}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
        <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-72 flex flex-col gap-1">
          <div className="max-h-72 overflow-y-auto flex flex-col gap-1.5 pr-0.5">
            {orgNames.map((org) => {
              const isCollapsed = collapsedOrgs[org];
              const orgProjects = grouped[org];

              return (
                <div key={org} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 group">
                    <button
                      onClick={() => toggleOrg(org)}
                      className="flex items-center gap-1.5 flex-1 text-left text-xs font-bold text-gray-500 uppercase tracking-wider truncate"
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      {isCollapsed ? <Folder size={14} className="text-blue-400" /> : <FolderOpen size={14} className="text-blue-500" />}
                      <span className="truncate">{org}</span>
                      <span className="text-[10px] font-normal text-gray-400">({orgProjects.length})</span>
                    </button>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => {
                          onCreateProject(org);
                          setIsOpen(false);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded-md"
                        title={`Novo quadro em ${org}`}
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        onClick={() => onRenameOrganization(org)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded-md"
                        title="Renomear organização"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="pl-3 flex flex-col gap-0.5">
                      {orgProjects.map((project) => {
                        const isActive = project.id === activeProjectId;
                        return (
                          <div
                            key={project.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl transition ${
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

                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => onChangeOrganization(project.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded-md"
                                title="Mover para outra organização"
                              >
                                <FolderInput size={13} />
                              </button>
                              <button
                                onClick={() => onRenameProject(project.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded-md"
                                title="Renomear quadro"
                              >
                                <Pencil size={13} />
                              </button>
                              {projects.length > 1 && (
                                <button
                                  onClick={() => onDeleteProject(project.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded-md"
                                  title="Excluir quadro"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-full h-px bg-gray-100 my-1" />

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onCreateProject();
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100 rounded-xl transition"
            >
              <Plus size={14} /> Novo quadro
            </button>
            <button
              onClick={() => {
                onCreateOrganization();
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100 rounded-xl transition"
            >
              <FolderPlus size={14} /> Nova org
            </button>
          </div>

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