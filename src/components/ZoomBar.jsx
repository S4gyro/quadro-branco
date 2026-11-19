import { ZoomIn, ZoomOut, Maximize, Crosshair } from 'lucide-react';

export default function ZoomBar({ scale, onZoom, onCenter }) {
  return (
    <div
      className="absolute right-3 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-md p-1.5 md:p-2 rounded-2xl shadow-xl flex flex-col gap-1.5 md:gap-2 z-40 border border-gray-100 items-center"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button onClick={() => onZoom(0.1, true)} className="p-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl transition" title="Aumentar Zoom">
        <ZoomIn size={20} />
      </button>
      <span className="text-[11px] font-bold text-gray-500 py-0.5 select-none">
        {Math.round(scale * 100)}%
      </span>
      <button onClick={() => onZoom(-0.1, true)} className="p-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl transition" title="Diminuir Zoom">
        <ZoomOut size={20} />
      </button>
      <div className="w-full h-px bg-gray-200 my-0.5"></div>
      <button onClick={() => onZoom(1, false)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl transition" title="Zoom 100%">
        <Maximize size={16} />
      </button>
      <button onClick={onCenter} className="p-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition" title="Centralizar itens">
        <Crosshair size={18} />
      </button>
    </div>
  );
}