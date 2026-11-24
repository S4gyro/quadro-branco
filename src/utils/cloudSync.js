import { supabase } from './supabase';
import { getDB, setDB } from './db';

export async function pushBoardToCloud(userId, boardData) {
  if (!supabase || !userId || !navigator.onLine) return false;
  const { error } = await supabase.from('boards').upsert({
    id: boardData.id,
    user_id: userId,
    name: boardData.name,
    organization: boardData.organization || 'Geral',
    items: boardData.items || [],
    trash_items: boardData.trashItems || [],
    connections: boardData.connections || [],
    view: boardData.view || { pan: { x: 0, y: 0 }, scale: 1 },
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function deleteBoardFromCloud(userId, boardId) {
  if (!supabase || !userId || !navigator.onLine) return;
  await supabase.from('boards').delete().eq('user_id', userId).eq('id', boardId);
}

export async function syncAllBoards(userId) {
  if (!supabase || !userId || !navigator.onLine) return null;

  const { data: cloudBoards, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId);

  if (error) return null;

  const localProjects = (await getDB('quadro_projects')) || [];

  // Se a nuvem estiver vazia, envia os quadros locais para lá
  if (!cloudBoards || cloudBoards.length === 0) {
    for (const proj of localProjects) {
      const [items, trashItems, connections, view] = await Promise.all([
        getDB(`board_${proj.id}_items`),
        getDB(`board_${proj.id}_trash`),
        getDB(`board_${proj.id}_connections`),
        getDB(`board_${proj.id}_view`),
      ]);
      await pushBoardToCloud(userId, {
        id: proj.id,
        name: proj.name,
        organization: proj.organization || 'Geral',
        items,
        trashItems,
        connections,
        view,
      });
    }
    return localProjects;
  }

  // Se já existem quadros na nuvem, baixa e salva no IndexedDB local
  const mergedProjects = cloudBoards.map((b) => ({
    id: b.id,
    name: b.name,
    organization: b.organization || 'Geral',
  }));
  await setDB('quadro_projects', mergedProjects);

  for (const b of cloudBoards) {
    await Promise.all([
      setDB(`board_${b.id}_items`, b.items || []),
      setDB(`board_${b.id}_trash`, b.trash_items || []),
      setDB(`board_${b.id}_connections`, b.connections || []),
      setDB(`board_${b.id}_view`, b.view || { pan: { x: 0, y: 0 }, scale: 1 }),
    ]);
  }

  return mergedProjects;
}