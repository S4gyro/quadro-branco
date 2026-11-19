import { useState, useEffect, useRef, useCallback } from 'react';
import BoardItem from './components/BoardItem';
import ConnectionsLayer from './components/ConnectionsLayer';
import ConnectionBar from './components/ConnectionBar';
import SelectionBar from './components/SelectionBar';
import SearchModal from './components/SearchModal';
import Toolbar from './components/Toolbar';
import ZoomBar from './components/ZoomBar';
import TrashModal from './components/TrashModal';
import ProjectBar from './components/ProjectBar';
import StatsPanel from './components/StatsPanel';
import { useCanvas } from './hooks/useCanvas';
import { useBoardData } from './hooks/useBoardData';
import { useAudioRecorder } from './hooks/useAudioRecorder';

export default function App() {
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState(null);
  const [selectedConnId, setSelectedConnId] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const clearSelections = useCallback(() => {
    setIsAudioMenuOpen(false);
    setConnectingFromId(null);
    setSelectedConnId(null);
    setSelectedIds([]);
    setIsSelectMode(false);
    setIsSearchOpen(false);
  }, []);

  const canvas = useCanvas({
    onBackgroundClick: clearSelections,
    onEscape: clearSelections,
  });

  const board = useBoardData({
    pan: canvas.pan,
    scale: canvas.scale,
    setPan: canvas.setPan,
    setScale: canvas.setScale,
  });

  const { isRecording, startRecording, stopRecording } = useAudioRecorder((audioBase64) => {
    board.addItem('audio', audioBase64);
  });

  // Atalhos: Ctrl+V (colar imagem), Ctrl+Z (desfazer), Ctrl+K (buscar)
  useEffect(() => {
    const handlePaste = (e) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;
      for (const item of clipboardItems) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => board.addItem('image', ev.target.result);
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !isTyping) {
        e.preventDefault();
        board.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board]);

  const handleFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => board.addItem(type, e.target.result);
      reader.readAsDataURL(file);
    }
    event.target.value = null;
    if (type === 'audio') setIsAudioMenuOpen(false);
  };

  const handleStartOrFinishConnect = (itemId) => {
    setIsSelectMode(false);
    setSelectedIds([]);
    if (!connectingFromId) {
      setConnectingFromId(itemId);
      setSelectedConnId(null);
      return;
    }
    if (connectingFromId === itemId) {
      setConnectingFromId(null);
      return;
    }
    const newId = board.addConnection(connectingFromId, itemId);
    if (newId) setSelectedConnId(newId);
    setConnectingFromId(null);
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleFocusItem = (item) => {
    const w = parseInt(item.width, 10) || 250;
    const h = parseInt(item.height, 10) || 200;
    canvas.setScale(1);
    canvas.setPan({
      x: window.innerWidth / 2 - (item.x + w / 2),
      y: window.innerHeight / 2 - (item.y + h / 2),
    });
  };

  const handleCenterView = () => {
    if (board.items.length === 0) {
      canvas.setPan({ x: 0, y: 0 });
      canvas.setScale(1);
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    board.items.forEach((item) => {
      const w = parseInt(item.width, 10) || 250;
      const h = parseInt(item.height, 10) || 200;
      if (item.x < minX) minX = item.x;
      if (item.y < minY) minY = item.y;
      if (item.x + w > maxX) maxX = item.x + w;
      if (item.y + h > maxY) maxY = item.y + h;
    });
    canvas.setScale(1);
    canvas.setPan({
      x: window.innerWidth / 2 - (minX + maxX) / 2,
      y: window.innerHeight / 2 - (minY + maxY) / 2,
    });
  };

  const selectedConn = board.connections.find((c) => c.id === selectedConnId);

  return (
    <div
      className="fixed inset-0 bg-gray-50 overflow-hidden select-none touch-none"
      style={{
        backgroundImage: `radial-gradient(#c1c1c1 ${1.5 * canvas.scale}px, transparent ${1.5 * canvas.scale}px)`,
        backgroundSize: `${20 * canvas.scale}px ${20 * canvas.scale}px`,
        backgroundPosition: `${canvas.pan.x}px ${canvas.pan.y}px`,
        cursor: canvas.isPanning ? 'grabbing' : 'grab',
      }}
      onMouseDown={canvas.handleMouseDown}
      onTouchStart={canvas.handleTouchStart}
      onTouchMove={canvas.handleTouchMove}
      onTouchEnd={canvas.handleTouchEnd}
    >
      <ProjectBar
        projects={board.projects}
        activeProjectId={board.activeProjectId}
        onSelectProject={(id) => {
          clearSelections();
          setIsTrashOpen(false);
          board.setActiveProjectId(id);
        }}
        onCreateProject={board.createProject}
        onRenameProject={board.renameProject}
        onDeleteProject={board.deleteProject}
        onExportProject={board.exportProject}
        onImportProject={board.importProject}
      />

      <StatsPanel
        items={board.items}
        trashItems={board.trashItems}
        connections={board.connections}
      />

      {connectingFromId && (
        <div
          onClick={() => setConnectingFromId(null)}
          className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs md:text-sm font-medium px-4 py-2 rounded-full shadow-lg cursor-pointer whitespace-nowrap"
        >
          Toque no item de destino para ligar (ou aqui para cancelar)
        </div>
      )}

      {isSelectMode && selectedIds.length === 0 && (
        <div
          onClick={() => setIsSelectMode(false)}
          className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs md:text-sm font-medium px-4 py-2 rounded-full shadow-lg cursor-pointer whitespace-nowrap"
        >
          Modo seleção: toque nos itens (ou aqui para sair)
        </div>
      )}

      <SelectionBar
        selectedCount={selectedIds.length}
        projects={board.projects}
        activeProjectId={board.activeProjectId}
        onMoveToProject={async (targetId) => {
          if (await board.transferItemsToProject(selectedIds, targetId)) {
            setSelectedIds([]);
            setIsSelectMode(false);
          }
        }}
        onDeleteSelected={() => {
          if (board.deleteMultipleItems(selectedIds)) {
            setSelectedIds([]);
            setIsSelectMode(false);
          }
        }}
        onClear={() => {
          setSelectedIds([]);
          setIsSelectMode(false);
        }}
      />

      <ConnectionBar
        connection={selectedConn}
        onUpdate={board.updateConnection}
        onDelete={(id) => {
          if (board.deleteConnection(id)) setSelectedConnId(null);
        }}
        onClose={() => setSelectedConnId(null)}
      />

      <div
        className="pointer-events-none"
        style={{
          transform: `translate(${canvas.pan.x}px, ${canvas.pan.y}px) scale(${canvas.scale})`,
          transformOrigin: '0 0',
        }}
      >
        <ConnectionsLayer
          items={board.items}
          connections={board.connections}
          selectedConnId={selectedConnId}
          onSelectConnection={setSelectedConnId}
        />

        {board.items.map((item) => (
          <BoardItem
            key={item.id}
            item={item}
            scale={canvas.scale}
            onUpdate={board.updateItem}
            onDelete={board.deleteItem}
            onActionStart={board.pushHistory}
            isConnectingSource={connectingFromId === item.id}
            isConnectingMode={Boolean(connectingFromId)}
            onStartOrFinishConnect={handleStartOrFinishConnect}
            isSelectMode={isSelectMode}
            isSelected={selectedIds.includes(item.id)}
            onToggleSelect={toggleSelectItem}
            onMoveSelected={(dx, dy) => board.moveItems(selectedIds, dx, dy)}
          />
        ))}
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload('image')} className="hidden" />
      <input type="file" accept="video/*" ref={videoInputRef} onChange={handleFileUpload('video')} className="hidden" />
      <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleFileUpload('audio')} className="hidden" />

      <Toolbar
        onAddText={() => board.addItem('text')}
        onTriggerImage={() => fileInputRef.current.click()}
        onTriggerVideo={() => videoInputRef.current.click()}
        onTriggerAudio={() => audioInputRef.current.click()}
        isRecording={isRecording}
        onStartRecording={async () => {
          if (await startRecording()) setIsAudioMenuOpen(false);
        }}
        onStopRecording={stopRecording}
        isAudioMenuOpen={isAudioMenuOpen}
        setIsAudioMenuOpen={setIsAudioMenuOpen}
        isSelectMode={isSelectMode}
        onToggleSelectMode={() => {
          setConnectingFromId(null);
          setSelectedConnId(null);
          setIsSelectMode((prev) => {
            if (prev) setSelectedIds([]);
            return !prev;
          });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onUndo={board.undo}
        canUndo={board.canUndo}
        trashCount={board.trashItems.length}
        onOpenTrash={() => setIsTrashOpen(true)}
      />

      <ZoomBar scale={canvas.scale} onZoom={canvas.handleZoom} onCenter={handleCenterView} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={board.items}
        onSelectItem={handleFocusItem}
      />

      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        trashItems={board.trashItems}
        onRestore={board.restoreItem}
        onEmptyTrash={() => {
          if (board.emptyTrash()) setIsTrashOpen(false);
        }}
      />
    </div>
  );
}