import { useState, useEffect, useRef } from 'react';

export function useCanvas({ onBackgroundClick, onEscape }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const lastTouchRef = useRef(null);
  const pinchRef = useRef(null);

  // Pan com Mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPanning) setPan((prev) => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    };
    const handleMouseUp = () => setIsPanning(false);

    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  // Zoom centralizado
  const handleZoom = (deltaOrTarget, isDelta = true) => {
    setScale((prevScale) => {
      let newScale = isDelta ? prevScale + deltaOrTarget : deltaOrTarget;
      newScale = Math.min(Math.max(newScale, 0.2), 2);
      if (newScale === prevScale) return prevScale;

      setPan((prevPan) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const canvasX = (centerX - prevPan.x) / prevScale;
        const canvasY = (centerY - prevPan.y) / prevScale;
        return { x: centerX - canvasX * newScale, y: centerY - canvasY * newScale };
      });
      return newScale;
    });
  };

  // Atalhos de Teclado e Scroll
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setScale((prevScale) => {
          const zoomDirection = e.deltaY < 0 ? 1 : -1;
          const newScale = Math.min(Math.max(prevScale + zoomDirection * 0.1, 0.2), 2);
          if (newScale === prevScale) return prevScale;

          setPan((prevPan) => {
            const canvasX = (e.clientX - prevPan.x) / prevScale;
            const canvasY = (e.clientY - prevPan.y) / prevScale;
            return { x: e.clientX - canvasX * newScale, y: e.clientY - canvasY * newScale };
          });
          return newScale;
        });
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onEscape?.();
      if (e.ctrlKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); handleZoom(0.1, true); }
        else if (e.key === '-') { e.preventDefault(); handleZoom(-0.1, true); }
        else if (e.key === '0') { e.preventDefault(); handleZoom(1, false); }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape]);

  // Mouse e Toque (Arraste + Pinça)
  const handleMouseDown = (e) => {
    if (e.target === e.currentTarget) onBackgroundClick?.();
    if (e.target === e.currentTarget || e.button === 1) setIsPanning(true);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const [t1, t2] = e.touches;
      pinchRef.current = {
        dist: Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY),
        scale,
        pan,
        midX: (t1.clientX + t2.clientX) / 2,
        midY: (t1.clientY + t2.clientY) / 2,
      };
      lastTouchRef.current = null;
      return;
    }

    if (e.target === e.currentTarget && e.touches.length === 1) {
      onBackgroundClick?.();
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const [t1, t2] = e.touches;
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const newMidX = (t1.clientX + t2.clientX) / 2;
      const newMidY = (t1.clientY + t2.clientY) / 2;
      const { dist, scale: sScale, pan: sPan, midX, midY } = pinchRef.current;

      const newScale = Math.min(Math.max(sScale * (newDist / dist), 0.2), 2);
      const canvasX = (midX - sPan.x) / sScale;
      const canvasY = (midY - sPan.y) / sScale;

      setScale(newScale);
      setPan({ x: newMidX - canvasX * newScale, y: newMidY - canvasY * newScale });
      return;
    }

    if (e.touches.length === 1 && lastTouchRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchRef.current.x;
      const dy = touch.clientY - lastTouchRef.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) lastTouchRef.current = null;
  };

  return {
    pan, setPan, scale, setScale, isPanning,
    handleZoom, handleMouseDown, handleTouchStart, handleTouchMove, handleTouchEnd,
  };
}