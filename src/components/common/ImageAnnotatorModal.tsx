import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  PenTool,
  Highlighter,
  Type,
  Eraser,
  Undo2,
  Trash2,
  Check,
  ZoomIn,
  Sparkles,
} from 'lucide-react';
import { downloadImage } from '../../lib/utils';

interface ImageAnnotatorModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  imageAlt?: string;
  onClose: () => void;
  onSaveAnnotated?: (annotatedDataUrl: string) => void;
}

type AnnotationTool = 'pen' | 'highlighter' | 'eraser';

const COLOR_PALETTE = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Yellow', hex: '#facc15' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'White', hex: '#ffffff' },
];

const STROKE_WIDTHS = [
  { label: 'Thin', size: 3 },
  { label: 'Medium', size: 6 },
  { label: 'Thick', size: 12 },
];

export const ImageAnnotatorModal: React.FC<ImageAnnotatorModalProps> = ({
  isOpen,
  imageUrl,
  imageAlt = 'Academic Doubt Attachment',
  onClose,
  onSaveAnnotated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const [activeTool, setActiveTool] = useState<AnnotationTool>('pen');
  const [activeColor, setActiveColor] = useState<string>('#ef4444');
  const [activeWidth, setActiveWidth] = useState<number>(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 400,
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Initialize canvas when modal opens and image changes
  useEffect(() => {
    if (!isOpen || !imageUrl) {
      setImageLoaded(false);
      setHistory([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    imageObjRef.current = img;

    img.onload = () => {
      // Calculate responsive display dimensions respecting aspect ratio
      const maxWidth = Math.min(window.innerWidth * 0.9, 900);
      const maxHeight = Math.min(window.innerHeight * 0.65, 600);

      let w = img.naturalWidth || 600;
      let h = img.naturalHeight || 400;

      const scale = Math.min(maxWidth / w, maxHeight / h, 1);
      const displayW = Math.round(w * scale);
      const displayH = Math.round(h * scale);

      setCanvasDimensions({ width: displayW, height: displayH });
      setImageLoaded(true);

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = displayW;
        canvas.height = displayH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, displayW, displayH);
          const initialSnapshot = ctx.getImageData(0, 0, displayW, displayH);
          setHistory([initialSnapshot]);
        }
      }
    };
  }, [isOpen, imageUrl]);

  // Redraw when dimensions change
  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageObjRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && history.length === 0) {
        ctx.drawImage(imageObjRef.current, 0, 0, canvasDimensions.width, canvasDimensions.height);
        setHistory([ctx.getImageData(0, 0, canvasDimensions.width, canvasDimensions.height)]);
      }
    }
  }, [imageLoaded, canvasDimensions]);

  // Get pointer coordinates normalized to canvas coordinate space
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Start Drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture pointer
    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = activeWidth * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `${activeColor}66`; // 40% opacity
      ctx.lineWidth = activeWidth * 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = activeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  // Move Drawing
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // End Drawing & Save snapshot for Undo
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
    setIsDrawing(false);

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {}

    // Save snapshot to history stack
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-20), snapshot]);
  };

  // Undo Last Action
  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = history.slice(0, -1);
    const prevSnapshot = nextHistory[nextHistory.length - 1];
    if (prevSnapshot) {
      ctx.putImageData(prevSnapshot, 0, 0);
      setHistory(nextHistory);
    }
  };

  // Clear Canvas (revert to original image)
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObjRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageObjRef.current, 0, 0, canvas.width, canvas.height);
    const cleanSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([cleanSnapshot]);
  };

  // Download Annotated Version
  const handleDownloadAnnotated = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `annotated-doubt-${Date.now()}.png`;
      downloadImage(dataUrl, filename);
      setSaveNotice('Annotated image downloaded!');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Download Original Version
  const handleDownloadOriginal = () => {
    if (!imageUrl) return;
    const filename = `doubt-photo-${Date.now()}.png`;
    downloadImage(imageUrl, filename);
    setSaveNotice('Original photo downloaded!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  // Save to Attachment callback (if supplied)
  const handleSaveToAttachment = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSaveAnnotated) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      onSaveAnnotated(dataUrl);
      setSaveNotice('Applied annotation to attachment!');
      setTimeout(() => {
        setSaveNotice(null);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                Annotate & Inspect Photo
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                Sketch, highlight key formulas, or download high-res images
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saveNotice && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{saveNotice}</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
              title="Close modal"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Floating Tools Toolbar */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
          {/* Tool Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTool('pen')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTool === 'pen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pen / Brush Tool"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Pen</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('highlighter')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTool === 'highlighter'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Highlighter Tool"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Highlight</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('eraser')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTool === 'eraser'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Eraser</span>
            </button>
          </div>

          {/* Color Palette (disabled in eraser mode) */}
          {activeTool !== 'eraser' && (
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {COLOR_PALETTE.map((color) => (
                <button
                  type="button"
                  key={color.hex}
                  onClick={() => setActiveColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    activeColor === color.hex ? 'scale-125 ring-2 ring-white shadow-sm' : 'hover:scale-110'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          )}

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {STROKE_WIDTHS.map((sw) => (
              <button
                type="button"
                key={sw.label}
                onClick={() => setActiveWidth(sw.size)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                  activeWidth === sw.size
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sw.label}
              </button>
            ))}
          </div>

          {/* Action History: Undo & Clear */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
              title="Undo last stroke"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-800 text-slate-300 hover:text-rose-400 transition-colors"
              title="Clear all annotations"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Canvas Workspace */}
        <div
          ref={containerRef}
          className="flex-1 bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-auto min-h-[250px] max-h-[65vh] relative select-none"
        >
          {!imageLoaded ? (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading high-resolution photo...</span>
            </div>
          ) : (
            <div className="relative inline-block rounded-xl overflow-hidden border border-slate-800 shadow-xl touch-none">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="cursor-crosshair max-w-full h-auto block select-none touch-none"
                style={{
                  width: `${canvasDimensions.width}px`,
                  height: `${canvasDimensions.height}px`,
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            {/* Download Original Photo button */}
            <button
              type="button"
              onClick={handleDownloadOriginal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
              title="Download original unedited photo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original</span>
            </button>

            {/* Download Annotated Photo button */}
            <button
              type="button"
              onClick={handleDownloadAnnotated}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              title="Download photo with your drawn annotations"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Annotated Photo</span>
            </button>
          </div>

          {/* If caller provided onSaveAnnotated (e.g. before submitting doubt/comment) */}
          {onSaveAnnotated && (
            <button
              type="button"
              onClick={handleSaveToAttachment}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Attachment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
