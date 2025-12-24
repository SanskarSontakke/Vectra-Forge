import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Clock, Download, X, Settings2, Check, CheckSquare, Square, Layers, History, Terminal } from 'lucide-react';
import { Button } from './ui/Button';

interface HistorySidebarProps {
  images: GeneratedImage[];
  onSelect: (img: GeneratedImage) => void;
  onBatchEdit: (images: GeneratedImage[]) => void;
}

interface ExportModalProps {
  image: GeneratedImage;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ image, onClose }) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(0.9);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // If JPEG, fill background with white (since JPEG doesn't support transparency)
        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `vectraforge-${image.id}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsProcessing(false);
        onClose();
      }
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 shadow-2xl w-full max-w-md relative flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-orange-500" /> Export Options
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">File Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`flex items-center justify-center gap-2 py-3 border transition-all
                  ${format === 'png' 
                    ? 'bg-orange-600/10 border-orange-500 text-orange-500' 
                    : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
              >
                <span className="font-bold">PNG</span>
                {format === 'png' && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`flex items-center justify-center gap-2 py-3 border transition-all
                  ${format === 'jpeg' 
                    ? 'bg-orange-600/10 border-orange-500 text-orange-500' 
                    : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
              >
                <span className="font-bold">JPG</span>
                {format === 'jpeg' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quality Slider (Visible only for JPG) */}
          <div className={`space-y-3 transition-opacity duration-300 ${format === 'jpeg' ? 'opacity-100' : 'opacity-30 pointer-events-none grayscale'}`}>
            <div className="flex justify-between items-center">
               <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Compression Quality</label>
               <span className="text-xs font-mono text-orange-500">{(quality * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.1" 
              value={quality} 
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <p className="text-[10px] text-zinc-600">
              {format === 'png' ? 'Lossless compression (Quality settings N/A)' : 'Lower quality reduces file size.'}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-xs py-2 px-4">Cancel</Button>
          <Button 
            onClick={handleDownload} 
            isLoading={isProcessing}
            className="text-xs py-2 px-6"
          >
            Download {format.toUpperCase()}
          </Button>
        </div>

      </div>
    </div>
  );
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ images, onSelect, onBatchEdit }) => {
  const [exportModalImage, setExportModalImage] = useState<GeneratedImage | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set()); // Clear on toggle
  };

  const toggleItemSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchAction = () => {
    const selectedImages = images.filter(img => selectedIds.has(img.id));
    onBatchEdit(selectedImages);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <>
      <div className="w-full lg:w-80 bg-black border-l border-zinc-800 h-full overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center sticky top-0 z-30">
          <h3 className="font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider text-sm">
            <Clock className="w-4 h-4 text-orange-600" /> Recent Output
          </h3>
          <button 
            onClick={toggleSelectionMode}
            disabled={images.length === 0}
            className={`p-1.5 rounded-sm transition-colors ${isSelectionMode ? 'text-orange-500 bg-orange-950/30' : 'text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500'}`}
            title="Toggle Selection Mode"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>

        {isSelectionMode && (
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-zinc-400">{selectedIds.size} Selected</span>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-[10px] text-zinc-500 hover:text-white underline"
              >
                Clear
              </button>
            </div>
            <Button 
              disabled={selectedIds.size === 0} 
              onClick={handleBatchAction}
              className="w-full text-xs py-2 flex items-center gap-2 justify-center"
            >
              <Layers className="w-3 h-3" /> Batch Edit ({selectedIds.size})
            </Button>
          </div>
        )}

        <div className="p-4 space-y-4 flex-1">
          {images.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-600 space-y-4">
              <div className="relative group opacity-50 hover:opacity-80 transition-opacity">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-800 group-hover:border-zinc-700 transition-colors">
                  <Terminal className="w-8 h-8 text-zinc-700 group-hover:text-zinc-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800">
                   <div className="w-2 h-2 bg-orange-600/50 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">System Log Empty</p>
                <p className="text-[10px] text-zinc-500 font-mono max-w-[200px] mx-auto leading-relaxed">
                  Initiate a <span className="text-orange-500">Mockup Forge</span> to begin population of the history matrix.
                </p>
              </div>
            </div>
          )}
          {images.map((img) => {
            const isSelected = selectedIds.has(img.id);
            return (
              <div 
                key={img.id} 
                className={`
                  group relative border transition-all cursor-pointer
                  ${isSelectionMode && isSelected 
                    ? 'bg-orange-950/20 border-orange-500 ring-1 ring-orange-500' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800'}
                `}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleItemSelection(img.id);
                  } else {
                    onSelect(img);
                  }
                }}
              >
                {isSelectionMode && (
                  <div className="absolute top-2 left-2 z-20">
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-600 border-orange-500' : 'bg-black/50 border-zinc-500'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}

                <div className="aspect-square w-full overflow-hidden bg-zinc-950 relative">
                    <img 
                      src={img.url} 
                      alt={img.prompt} 
                      className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`} 
                      loading="lazy"
                    />
                </div>
              
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 
                      ${img.type === 'mockup' ? 'bg-orange-600 text-white' : 
                        img.type === 'pro-gen' ? 'bg-yellow-600 text-white' : 
                        'bg-blue-600 text-white'}`}>
                      {img.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(img.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 font-mono" title={img.prompt}>
                    {img.prompt}
                  </p>
                </div>
                
                {/* Overlay actions (Hidden in selection mode) */}
                {!isSelectionMode && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setExportModalImage(img);
                      }}
                      className="p-1.5 bg-black/90 hover:bg-orange-600 text-white border border-zinc-700 hover:border-orange-500 transition-colors"
                      title="Export Options"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Modal Portal */}
      {exportModalImage && (
        <ExportModal 
          image={exportModalImage} 
          onClose={() => setExportModalImage(null)} 
        />
      )}
    </>
  );
};