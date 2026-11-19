import { Plus, Image as ImageIcon, Mic, Square, Upload, Video, Trash2, CheckSquare, Search, Undo2 } from 'lucide-react';

export default function Toolbar({
  onAddText,
  onTriggerImage,
  onTriggerAudio,
  onTriggerVideo,
  isRecording,
  onStartRecording,
  onStopRecording,
  isAudioMenuOpen,
  setIsAudioMenuOpen,
  isSelectMode,
  onToggleSelectMode,
  onOpenSearch,
  onUndo,
  canUndo,
  trashCount,
  onOpenTrash,
}) {
  return (
    <div
      className="absolute left-3 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-md p-2 md:p-3 rounded-2xl shadow-xl flex flex-col gap-1.5 md:gap-2.5 z-40 w-auto md:w-40 border border-gray-100"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button onClick={onAddText} className="flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition shadow-sm font-medium w-full" title="Texto">
        <Plus size={20} /> <span className="hidden md:inline">Texto</span>
      </button>

      <button onClick={onTriggerImage} className="flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium w-full border border-gray-100" title="Imagem">
        <ImageIcon size={20} className="text-gray-500" /> <span className="hidden md:inline">Imagem</span>
      </button>

      <button onClick={onTriggerVideo} className="flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium w-full border border-gray-100" title="Vídeo">
        <Video size={20} className="text-gray-500" /> <span className="hidden md:inline">Vídeo</span>
      </button>

      <div className="relative">
        {isRecording ? (
          <button onClick={onStopRecording} className="flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium w-full animate-pulse shadow-sm" title="Parar gravação">
            <Square size={18} fill="currentColor" /> <span className="hidden md:inline">Parar</span>
          </button>
        ) : (
          <button onClick={() => setIsAudioMenuOpen((prev) => !prev)} className="flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium w-full border border-gray-100" title="Áudio">
            <Mic size={20} className="text-gray-500" /> <span className="hidden md:inline">Áudio</span>
          </button>
        )}

        {isAudioMenuOpen && !isRecording && (
          <div className="absolute left-full top-0 ml-2 md:ml-3 bg-white p-2 rounded-xl shadow-xl border border-gray-100 flex flex-col gap-1 w-40 z-50">
            <button onClick={onStartRecording} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition font-medium w-full">
              <Mic size={16} /> Gravar agora
            </button>
            <button onClick={onTriggerAudio} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium w-full">
              <Upload size={16} /> Enviar arquivo
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-px bg-gray-200 my-0.5"></div>

      <button
        onClick={onToggleSelectMode}
        className={`flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 rounded-xl transition font-medium w-full border ${
          isSelectMode
            ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-sm'
            : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
        }`}
        title="Selecionar vários"
      >
        <CheckSquare size={20} className={isSelectMode ? 'text-blue-600' : 'text-gray-500'} />
        <span className="hidden md:inline">Selecionar</span>
      </button>

      <button onClick={onOpenSearch} className="flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium w-full border border-gray-100" title="Buscar (Ctrl + K)">
        <Search size={20} className="text-gray-500" /> <span className="hidden md:inline">Buscar</span>
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-2.5 rounded-xl transition font-medium w-full border ${
          canUndo
            ? 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
            : 'bg-gray-50/50 text-gray-300 border-transparent cursor-not-allowed'
        }`}
        title="Desfazer (Ctrl + Z)"
      >
        <Undo2 size={20} /> <span className="hidden md:inline">Desfazer</span>
      </button>

      <div className="w-full h-px bg-gray-200 my-0.5"></div>

      <button onClick={onOpenTrash} className="flex items-center justify-center md:justify-between p-2.5 md:px-4 md:py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium w-full relative" title="Lixeira">
        <div className="flex items-center gap-3">
          <Trash2 size={20} /> <span className="hidden md:inline">Lixeira</span>
        </div>
        {trashCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 md:static bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
            {trashCount}
          </span>
        )}
      </button>
    </div>
  );
}