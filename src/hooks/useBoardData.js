import { useState, useEffect } from 'react';
import { getDB, setDB, deleteDB } from '../utils/db';

export function useBoardData({ pan, scale, setPan, setScale }) {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [loadedProjectId, setLoadedProjectId] = useState(null);

  const [items, setItems] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function initProjects() {
      let savedProjects = await getDB('quadro_projects');
      if (!savedProjects || savedProjects.length === 0) {
        savedProjects = [{ id: 'default', name: 'Quadro Principal', organization: 'Geral' }];
        await setDB('quadro_projects', savedProjects);
      } else {
        savedProjects = savedProjects.map((p) => ({
          ...p,
          organization: p.organization || 'Geral',
        }));
      }
      const lastActive = localStorage.getItem('quadro_active_project');
      const validId = savedProjects.some((p) => p.id === lastActive) ? lastActive : savedProjects[0].id;
      setProjects(savedProjects);
      setActiveProjectId(validId);
    }
    initProjects();
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    let cancelled = false;

    async function loadProjectData() {
      setLoadedProjectId(null);
      setHistory([]);
      localStorage.setItem('quadro_active_project', activeProjectId);

      const [savedItems, savedTrash, savedConns, savedView] = await Promise.all([
        getDB(`board_${activeProjectId}_items`),
        getDB(`board_${activeProjectId}_trash`),
        getDB(`board_${activeProjectId}_connections`),
        getDB(`board_${activeProjectId}_view`),
      ]);

      if (cancelled) return;
      setItems(savedItems || []);
      setTrashItems(savedTrash || []);
      setConnections(savedConns || []);
      setPan(savedView?.pan || { x: 0, y: 0 });
      setScale(savedView?.scale || 1);
      setLoadedProjectId(activeProjectId);
    }

    loadProjectData();
    return () => { cancelled = true; };
  }, [activeProjectId, setPan, setScale]);

  useEffect(() => {
    if (projects.length > 0) setDB('quadro_projects', projects);
  }, [projects]);

  useEffect(() => {
    if (!activeProjectId || loadedProjectId !== activeProjectId) return;
    const timer = setTimeout(() => setDB(`board_${activeProjectId}_items`, items), 250);
    return () => clearTimeout(timer);
  }, [items, activeProjectId, loadedProjectId]);

  useEffect(() => {
    if (!activeProjectId || loadedProjectId !== activeProjectId) return;
    setDB(`board_${activeProjectId}_trash`, trashItems);
  }, [trashItems, activeProjectId, loadedProjectId]);

  useEffect(() => {
    if (!activeProjectId || loadedProjectId !== activeProjectId) return;
    setDB(`board_${activeProjectId}_connections`, connections);
  }, [connections, activeProjectId, loadedProjectId]);

  useEffect(() => {
    if (!activeProjectId || loadedProjectId !== activeProjectId) return;
    const timer = setTimeout(() => setDB(`board_${activeProjectId}_view`, { pan, scale }), 250);
    return () => clearTimeout(timer);
  }, [pan, scale, activeProjectId, loadedProjectId]);

  // Histórico (Desfazer)
  const pushHistory = () => {
    setHistory((prev) => [...prev.slice(-19), { items, connections, trashItems }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setItems(last.items);
    setConnections(last.connections);
    setTrashItems(last.trashItems);
    setHistory((prev) => prev.slice(0, -1));
  };

  // CRUD Projetos e Organizações
  const createProject = (targetOrg) => {
    const activeProj = projects.find((p) => p.id === activeProjectId);
    const orgName = typeof targetOrg === 'string' && targetOrg.trim()
      ? targetOrg.trim()
      : activeProj?.organization || 'Geral';

    const name = window.prompt(`Nome do novo quadro em "${orgName}":`, `Quadro ${projects.length + 1}`);
    if (!name || !name.trim()) return;

    const newProj = { id: Date.now().toString(), name: name.trim(), organization: orgName };
    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const createOrganization = () => {
    const orgName = window.prompt('Nome da nova organização:');
    if (!orgName || !orgName.trim()) return;
    const boardName = window.prompt(`Nome do primeiro quadro em "${orgName.trim()}":`, 'Quadro 1');
    if (!boardName || !boardName.trim()) return;

    const newProj = { id: Date.now().toString(), name: boardName.trim(), organization: orgName.trim() };
    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const renameOrganization = (oldOrgName) => {
    const newOrgName = window.prompt('Novo nome da organização:', oldOrgName);
    if (!newOrgName || !newOrgName.trim() || newOrgName.trim() === oldOrgName) return;
    setProjects((prev) =>
      prev.map((p) => ((p.organization || 'Geral') === oldOrgName ? { ...p, organization: newOrgName.trim() } : p))
    );
  };

  const changeProjectOrganization = (id) => {
    const target = projects.find((p) => p.id === id);
    const orgName = window.prompt('Mover quadro para qual organização?', target?.organization || 'Geral');
    if (!orgName || !orgName.trim()) return;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, organization: orgName.trim() } : p)));
  };

  const renameProject = (id) => {
    const target = projects.find((p) => p.id === id);
    const name = window.prompt('Novo nome do quadro:', target?.name || '');
    if (!name || !name.trim()) return;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
  };

  const deleteProject = async (id) => {
    if (projects.length <= 1) return;
    const target = projects.find((p) => p.id === id);
    if (!window.confirm(`Excluir o quadro "${target?.name}" permanentemente?`)) return;

    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) setActiveProjectId(remaining[0].id);

    await Promise.all([
      deleteDB(`board_${id}_items`),
      deleteDB(`board_${id}_trash`),
      deleteDB(`board_${id}_connections`),
      deleteDB(`board_${id}_view`),
    ]);
  };

  // Backup (.json)
  const exportProject = () => {
    const active = projects.find((p) => p.id === activeProjectId);
    const data = {
      name: active?.name || 'Quadro',
      organization: active?.organization || 'Geral',
      items,
      trashItems,
      connections,
      view: { pan, scale },
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(active?.name || 'quadro').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProject = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.items)) throw new Error();
        const newId = Date.now().toString();
        const newProj = {
          id: newId,
          name: data.name || `Importado ${projects.length + 1}`,
          organization: data.organization || 'Geral',
        };

        await Promise.all([
          setDB(`board_${newId}_items`, data.items || []),
          setDB(`board_${newId}_trash`, data.trashItems || []),
          setDB(`board_${newId}_connections`, data.connections || []),
          setDB(`board_${newId}_view`, data.view || { pan: { x: 0, y: 0 }, scale: 1 }),
        ]);

        setProjects((prev) => [...prev, newProj]);
        setActiveProjectId(newId);
      } catch {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  // CRUD Itens e Lixeira
  const addItem = (type, content = '') => {
    pushHistory();
    const dimensions = {
      text: { width: 250, height: 200 },
      image: { width: 300, height: 350 },
      video: { width: 360, height: 260 },
      audio: { width: 300, height: 145 },
    };
    const newItem = {
      id: Date.now().toString(),
      type,
      x: (window.innerWidth / 2 - pan.x) / scale - dimensions[type].width / 2,
      y: (window.innerHeight / 2 - pan.y) / scale - dimensions[type].height / 2,
      title: '',
      content,
      width: dimensions[type].width,
      height: dimensions[type].height,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id, newProps) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...newProps } : item)));
  };

  const moveItems = (ids, dx, dy) => {
    if (dx === 0 && dy === 0) return;
    setItems((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, x: item.x + dx, y: item.y + dy } : item))
    );
  };

  const deleteItem = (id) => {
    if (window.confirm('Deseja mover este item para a lixeira?')) {
      const target = items.find((item) => item.id === id);
      if (target) {
        pushHistory();
        setTrashItems((prev) => (prev.some((i) => i.id === id) ? prev : [...prev, target]));
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  const deleteMultipleItems = (ids) => {
    if (ids.length === 0) return false;
    if (!window.confirm(`Mover ${ids.length} item(ns) para a lixeira?`)) return false;

    pushHistory();
    const toDelete = items.filter((item) => ids.includes(item.id));
    setTrashItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      return [...prev, ...toDelete.filter((i) => !existingIds.has(i.id))];
    });
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
    return true;
  };

  const transferItemsToProject = async (ids, targetProjectId) => {
    if (!targetProjectId || targetProjectId === activeProjectId || ids.length === 0) return false;

    pushHistory();
    const itemsToMove = items.filter((item) => ids.includes(item.id));
    const connsToMove = connections.filter((c) => ids.includes(c.from) && ids.includes(c.to));

    const [targetItems, targetConns] = await Promise.all([
      getDB(`board_${targetProjectId}_items`),
      getDB(`board_${targetProjectId}_connections`),
    ]);

    await Promise.all([
      setDB(`board_${targetProjectId}_items`, [...(targetItems || []), ...itemsToMove]),
      setDB(`board_${targetProjectId}_connections`, [...(targetConns || []), ...connsToMove]),
    ]);

    setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
    setConnections((prev) => prev.filter((c) => !ids.includes(c.from) && !ids.includes(c.to)));
    return true;
  };

  const restoreItem = (id) => {
    const target = trashItems.find((item) => item.id === id);
    if (target) {
      pushHistory();
      setItems((prev) => (prev.some((i) => i.id === id) ? prev : [...prev, target]));
      setTrashItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const emptyTrash = () => {
    if (window.confirm('Isso apagará os itens permanentemente. Continuar?')) {
      setTrashItems([]);
      return true;
    }
    return false;
  };

  // CRUD Conexões
  const addConnection = (from, to) => {
    const exists = connections.some(
      (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );
    if (exists) return null;
    pushHistory();
    const newId = Date.now().toString();
    setConnections((prev) => [...prev, { id: newId, from, to, color: '#60a5fa', label: '', dashed: false }]);
    return newId;
  };

  const updateConnection = (id, newProps) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...newProps } : c)));
  };

  const deleteConnection = (id) => {
    if (window.confirm('Remover esta ligação?')) {
      pushHistory();
      setConnections((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
    return false;
  };

  return {
    projects, activeProjectId, setActiveProjectId,
    createProject, createOrganization, renameOrganization, changeProjectOrganization,
    renameProject, deleteProject, exportProject, importProject,
    items, trashItems, connections,
    addItem, updateItem, moveItems, deleteItem, deleteMultipleItems, transferItemsToProject,
    restoreItem, emptyTrash,
    addConnection, updateConnection, deleteConnection,
    pushHistory, undo, canUndo: history.length > 0,
  };
}