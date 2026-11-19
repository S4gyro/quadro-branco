import { Rnd } from 'react-rnd';
import { GripHorizontal, Trash2, Link2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const NOTE_COLORS = {
  yellow: {
    card: 'bg-yellow-50 border-yellow-200',
    header: 'bg-yellow-200/80 border-yellow-300 hover:bg-yellow-300',
    dot: 'bg-yellow-400',
  },
  blue: {
    card: 'bg-blue-50 border-blue-200',
    header: 'bg-blue-200/80 border-blue-300 hover:bg-blue-300',
    dot: 'bg-blue-400',
  },
  green: {
    card: 'bg-green-50 border-green-200',
    header: 'bg-green-200/80 border-green-300 hover:bg-green-300',
    dot: 'bg-green-400',
  },
  pink: {
    card: 'bg-pink-50 border-pink-200',
    header: 'bg-pink-200/80 border-pink-300 hover:bg-pink-300',
    dot: 'bg-pink-400',
  },
};

export default function BoardItem({
  item,
  scale,
  onUpdate,
  onDelete,
  onActionStart,
  isConnectingSource,
  isConnectingMode,
  onStartOrFinishConnect,
  isSelectMode,
  isSelected,
  onToggleSelect,
  onMoveSelected,
}) {
  const noteTheme = NOTE_COLORS[item.color] || NOTE_COLORS.yellow;

  const handleDrag = (e, d) => {
    if (isSelected) {
      onMoveSelected(d.x - item.x, d.y - item.y);
    } else {
      onUpdate(item.id, { x: d.x, y: d.y });
    }
  };

  return (
    <div
      className="pointer-events-auto absolute top-0 left-0"
      onClick={(e) => {
        if (isSelectMode) {
          e.stopPropagation();
          onToggleSelect(item.id);
          return;
        }
        if (isConnectingMode && !isConnectingSource) {
          e.stopPropagation();
          onStartOrFinishConnect(item.id);
        }
      }}
    >
      <Rnd
        scale={scale}
        cancel=".no-drag"
        size={{ width: item.width, height: item.height }}
        position={{ x: item.x, y: item.y }}
        minWidth={item.type === 'audio' ? 240 : item.type === 'video' ? 260 : 150}
        minHeight={item.type === 'audio' ? 130 : item.type === 'video' ? 200 : 150}
        onDrag={handleDrag}
        onDragStop={handleDrag}
        onDragStart={onActionStart}
        onResizeStart={onActionStart}
        onResizeStop={(e, direction, ref, delta, position) => {
          const currentWidth = parseInt(item.width, 10) || 250;
          const currentHeight = parseInt(item.height, 10) || 200;
          onUpdate(item.id, {
            width: currentWidth + delta.width,
            height: currentHeight + delta.height,
            x: position.x,
            y: position.y,
          });
        }}
        dragHandleClassName="drag-handle"
        resizeHandleStyles={{
          bottomRight: { width: '32px', height: '32px', right: '-2px', bottom: '-2px', zIndex: 20 },
        }}
        resizeHandleComponent={{
          bottomRight: (
            <div className="w-8 h-8 flex items-end justify-end p-1.5 cursor-se-resize touch-none">
              <div className="w-3.5 h-3.5 border-r-[3px] border-b-[3px] border-gray-400/80 rounded-br-sm" />
            </div>
          ),
        }}
        className={`shadow-xl rounded-xl flex flex-col overflow-hidden group border transition-shadow ${
          item.type === 'text' ? noteTheme.card : 'bg-white border-gray-200'
        } ${isSelected || isConnectingSource ? 'ring-4 ring-blue-500' : ''} ${
          (isConnectingMode && !isConnectingSource) || (isSelectMode && !isSelected)
            ? 'ring-2 ring-blue-300/70 cursor-pointer'
            : ''
        }`}
      >
        <div
          className={`drag-handle w-full h-8 flex items-center justify-between px-2 cursor-move border-b transition-colors absolute top-0 left-0 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
            item.type === 'text' ? noteTheme.header : 'bg-gray-100/90 border-gray-200 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <GripHorizontal size={16} className="text-gray-600" />
            {item.type === 'text' && (
              <div className="flex items-center gap-1 ml-1">
                {Object.entries(NOTE_COLORS).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(item.id, { color: key });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`no-drag w-3.5 h-3.5 rounded-full ${cfg.dot} border border-black/15 transition-transform ${
                      (item.color || 'yellow') === key ? 'scale-125 ring-1 ring-gray-600' : ''
                    }`}
                    title={`Cor ${key}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartOrFinishConnect(item.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={`no-drag transition-colors p-1.5 rounded ${
                isConnectingSource ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:text-blue-600'
              }`}
              title="Ligar a outro item"
            >
              <Link2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="no-drag text-gray-600 hover:text-red-500 transition-colors p-1.5"
              title="Mover para Lixeira"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {item.type === 'text' && (
          <div className="flex flex-col flex-1 h-full pt-8">
            <input
              className="w-full bg-transparent font-bold text-gray-900 placeholder-gray-500/70 outline-none px-3 pb-1"
              placeholder="Título da nota"
              defaultValue={item.title || ''}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
            <textarea
              className="w-full flex-1 bg-transparent resize-none outline-none text-gray-800 px-3 pb-3 pt-1"
              defaultValue={item.content}
              placeholder="Digite suas anotações aqui..."
              onChange={(e) => onUpdate(item.id, { content: e.target.value })}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {item.type === 'image' && (
          <div className="flex flex-col flex-1 h-full pt-8 p-2">
            <input
              className="w-full bg-transparent font-bold text-gray-900 placeholder-gray-500/70 outline-none px-2 pb-2"
              placeholder="Título da imagem"
              defaultValue={item.title || ''}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
              <img src={item.content} alt="Imagem anexada" className="w-full h-full object-contain pointer-events-none" />
            </div>
          </div>
        )}

        {item.type === 'video' && (
          <div className="flex flex-col flex-1 h-full pt-8 p-2">
            <input
              className="w-full bg-transparent font-bold text-gray-900 placeholder-gray-500/70 outline-none px-2 pb-2"
              placeholder="Título do vídeo"
              defaultValue={item.title || ''}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden bg-black rounded-lg">
              <video
                controls
                src={item.content}
                className="w-full h-full object-contain outline-none"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {item.type === 'audio' && (
          <div className="flex flex-col flex-1 h-full pt-8 px-3 pb-3 justify-between">
            <input
              className="w-full bg-transparent font-bold text-gray-900 placeholder-gray-500/70 outline-none pb-2"
              placeholder="Título do áudio"
              defaultValue={item.title || ''}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
            <AudioPlayer src={item.content} />
          </div>
        )}
      </Rnd>
    </div>
  );
}