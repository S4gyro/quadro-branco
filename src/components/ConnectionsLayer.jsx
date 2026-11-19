export default function ConnectionsLayer({ items, connections, selectedConnId, onSelectConnection }) {
  return (
    <div className="absolute top-0 left-0 pointer-events-none">
      <svg className="overflow-visible" style={{ width: 1, height: 1 }}>
        {connections.map((conn) => {
          const fromItem = items.find((i) => i.id === conn.from);
          const toItem = items.find((i) => i.id === conn.to);
          if (!fromItem || !toItem) return null;

          const x1 = fromItem.x + (parseInt(fromItem.width, 10) || 250) / 2;
          const y1 = fromItem.y + (parseInt(fromItem.height, 10) || 200) / 2;
          const x2 = toItem.x + (parseInt(toItem.width, 10) || 250) / 2;
          const y2 = toItem.y + (parseInt(toItem.height, 10) || 200) / 2;

          const dx = (x2 - x1) * 0.5;
          const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
          const isSelected = selectedConnId === conn.id;
          const color = conn.color || '#60a5fa';

          return (
            <g key={conn.id}>
              <path
                d={pathData}
                stroke={color}
                strokeWidth={isSelected ? 5 : 3}
                strokeDasharray={conn.dashed ? '8,6' : undefined}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={pathData}
                stroke="transparent"
                strokeWidth={22}
                fill="none"
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectConnection(conn.id);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  onSelectConnection(conn.id);
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Rótulos no meio das linhas */}
      {connections.map((conn) => {
        if (!conn.label) return null;
        const fromItem = items.find((i) => i.id === conn.from);
        const toItem = items.find((i) => i.id === conn.to);
        if (!fromItem || !toItem) return null;

        const midX = (fromItem.x + (parseInt(fromItem.width, 10) || 250) / 2 + toItem.x + (parseInt(toItem.width, 10) || 250) / 2) / 2;
        const midY = (fromItem.y + (parseInt(fromItem.height, 10) || 200) / 2 + toItem.y + (parseInt(toItem.height, 10) || 200) / 2) / 2;

        return (
          <div
            key={`label-${conn.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectConnection(conn.id);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onSelectConnection(conn.id);
            }}
            style={{
              left: midX,
              top: midY,
              borderColor: conn.color || '#60a5fa',
            }}
            className="pointer-events-auto cursor-pointer absolute -translate-x-1/2 -translate-y-1/2 bg-white/95 border-2 px-2.5 py-0.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm whitespace-nowrap"
          >
            {conn.label}
          </div>
        );
      })}
    </div>
  );
}