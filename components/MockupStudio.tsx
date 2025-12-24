import React, { useState, useRef } from 'react';
import { ProductType, GeneratedImage } from '../types';
import { generateMockup } from '../services/geminiService';
import { Button } from './ui/Button';
import { ForgeLoader } from './ui/ForgeLoader';
import { Upload, Shirt, Coffee, Box, ShoppingBag, Palette, ZoomIn, ZoomOut, Check, Layers, RefreshCcw, Sun, ArrowDownLeft, ArrowDown, ArrowDownRight, Move, CircleDot } from 'lucide-react';

interface MockupStudioProps {
  onImageGenerated: (img: GeneratedImage) => void;
}

const COLORS = [
  { name: 'White', hex: '#FFFFFF', class: 'bg-white' },
  { name: 'Black', hex: '#18181b', class: 'bg-zinc-950' },
  { name: 'Heather Grey', hex: '#a1a1aa', class: 'bg-zinc-400' },
  { name: 'Navy Blue', hex: '#1e3a8a', class: 'bg-blue-900' },
  { name: 'Cardinal Red', hex: '#b91c1c', class: 'bg-red-800' },
  { name: 'Forest Green', hex: '#14532d', class: 'bg-green-900' },
  { name: 'Burnt Orange', hex: '#ea580c', class: 'bg-orange-600' },
];

const SHADOW_COLORS = [
    { name: 'Pitch Black', class: 'bg-black' },
    { name: 'Charcoal', class: 'bg-zinc-700' },
    { name: 'Deep Navy', class: 'bg-slate-900' },
    { name: 'Warm Umber', class: 'bg-stone-800' },
];

const SHADOW_DIRECTIONS = [
    { id: 'Bottom-Left', icon: <ArrowDownLeft className="w-4 h-4" />, label: 'Left' },
    { id: 'Directly Below', icon: <ArrowDown className="w-4 h-4" />, label: 'Below' },
    { id: 'Bottom-Right', icon: <ArrowDownRight className="w-4 h-4" />, label: 'Right' },
    { id: 'Soft Diffuse', icon: <Move className="w-4 h-4" />, label: 'Soft' },
];

export const MockupStudio: React.FC<MockupStudioProps> = ({ onImageGenerated }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>(['mug']);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].name);
  const [prompt, setPrompt] = useState('');
  
  // Shadow State
  const [shadowStrength, setShadowStrength] = useState(60);
  const [shadowColor, setShadowColor] = useState('Pitch Black');
  const [shadowDirection, setShadowDirection] = useState('Bottom-Right');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(50); // 0 to 100
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isShimmering, setIsShimmering] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        setZoom(50); // Reset zoom on new file
        setIsShimmering(true);
        setTimeout(() => setIsShimmering(false), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isGenerating) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isGenerating) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const toggleProduct = (id: ProductType) => {
    setSelectedProducts(prev => {
        if (prev.includes(id)) {
            return prev.filter(p => p !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  const getZoomDescriptor = (val: number) => {
    if (val < 25) return "Small, discreet logo branding";
    if (val < 75) return "Medium, standard size logo branding";
    return "Large, prominent, oversized logo branding";
  };

  const adjustZoom = (amount: number) => {
    setZoom(prev => Math.min(100, Math.max(0, prev + amount)));
  };

  const handleGenerate = async () => {
    if (!logo || selectedProducts.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    setStatus(`INITIALIZING PARALLEL FORGE (${selectedProducts.length} ITEMS)...`);
    
    try {
      const total = selectedProducts.length;
      let completedCount = 0;
      
      const logoScaleDesc = getZoomDescriptor(zoom);
      
      // Construct Shadow Prompt
      const shadowInstruction = `
        Shadow Physics: Cast shadows towards ${shadowDirection}. 
        Shadow Intensity: ${shadowStrength}% opacity/strength. 
        Shadow Color Tone: ${shadowColor}.
      `.trim();

      // Combine user prompt with shadow instruction
      const fullPrompt = `${prompt} ${shadowInstruction}`.trim();

      // Create a promise for each product generation
      const promises = selectedProducts.map(async (product) => {
        const isApparel = ['t-shirt', 'hoodie'].includes(product);
        const colorToUse = isApparel ? selectedColor : undefined;

        try {
          const resultBase64 = await generateMockup(logo, product, fullPrompt, colorToUse, logoScaleDesc);
          
          // Update progress as each one completes
          completedCount++;
          setProgress((completedCount / total) * 95); // Cap at 95 until all done
          
          return {
            success: true,
            product,
            color: colorToUse,
            url: resultBase64
          };
        } catch (err) {
          console.error(`Error generating ${product}`, err);
          return {
             success: false,
             product,
             error: err
          };
        }
      });

      // Animated status updates while waiting
      const statusInterval = setInterval(() => {
         setStatus(prev => {
            if (prev.includes('INITIALIZING')) return 'ALLOCATING NEURAL THREADS...';
            if (prev.includes('ALLOCATING')) return 'SYNCHRONIZING BATCH RENDER...';
            if (prev.includes('SYNCHRONIZING')) return 'FINALIZING COMPOSITES...';
            return prev;
         });
      }, 1500);

      // Wait for ALL to complete
      const results = await Promise.all(promises);
      
      clearInterval(statusInterval);
      setProgress(100);
      setStatus('BATCH SEQUENCE COMPLETE');

      // Process results together
      results.forEach((res) => {
        if (res.success && res.url) {
           const newImage: GeneratedImage = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            url: res.url!,
            prompt: `Mockup: ${res.color ? res.color + ' ' : ''}${res.product} ${prompt} (Shadows: ${shadowStrength}%, ${shadowDirection})`,
            createdAt: Date.now(),
            type: 'mockup'
          };
          onImageGenerated(newImage);
        }
      });

      // Short delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      alert("Failed to generate mockups. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const products: { id: ProductType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'mug', 
      label: 'Ceramic Mug', 
      icon: <Coffee className="w-5 h-5" />,
      description: "Premium 11oz ceramic vessel with a high-gloss finish. Features a C-handle for comfort. Ideal for corporate swag, coffee shop merchandising, or personalized gifts."
    },
    { 
      id: 't-shirt', 
      label: 'T-Shirt', 
      icon: <Shirt className="w-5 h-5" />,
      description: "100% combed ring-spun cotton. Classic unisex crew neck fit with side-seamed construction. Perfect canvas for streetwear brands, event merch, and casual daily wear."
    },
    { 
      id: 'hoodie', 
      label: 'Hoodie', 
      icon: <Shirt className="w-5 h-5" />,
      description: "Heavyweight 80/20 cotton-poly blend fleece. Features a double-lined hood and spacious kangaroo pocket. The go-to choice for urban fashion, team uniforms, and cold-weather comfort."
    },
    { 
      id: 'tote-bag', 
      label: 'Tote Bag', 
      icon: <ShoppingBag className="w-5 h-5" />,
      description: "Durable 100% cotton canvas with reinforced stitching at stress points. Long handles for shoulder carrying. An eco-conscious alternative for grocery runs, books, and trade show giveaways."
    },
    { 
      id: 'notebook', 
      label: 'Notebook', 
      icon: <Box className="w-5 h-5" />,
      description: "Hardcover spiral-bound notebook with 120gsm acid-free paper. Features a matte finish cover. Essential for corporate stationery, academic planning, and creative sketching."
    },
  ];

  const showColorPicker = selectedProducts.some(p => ['t-shirt', 'hoodie'].includes(p));

  return (
    <div className="space-y-8 p-6 bg-zinc-900 border border-zinc-800 shadow-2xl">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide border-l-4 border-orange-600 pl-3">1. Upload Logo</h2>
        <div 
          onClick={(e) => {
             // Only open file picker if click was directly on container or text, not on controls
             if (!isGenerating && fileInputRef.current) {
                fileInputRef.current.click();
             }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden
            ${isDragging 
              ? 'border-orange-500 bg-orange-950/30 scale-[1.02] shadow-[0_0_40px_rgba(234,88,12,0.2)] ring-1 ring-orange-500/50' 
              : ''}
            ${!isDragging && logo ? 'border-orange-500 bg-orange-900/10' : ''}
            ${!isDragging && !logo ? 'border-zinc-700 hover:border-orange-500 hover:bg-zinc-800' : ''}
            ${isGenerating ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {/* Animated background stripes when dragging */}
          {isDragging && (
             <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(234,88,12,0.05)_25%,transparent_25%,transparent_50%,rgba(234,88,12,0.05)_50%,rgba(234,88,12,0.05)_75%,transparent_75%,transparent)] bg-[length:30px_30px] animate-[slide_1s_linear_infinite] pointer-events-none z-0"></div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          {logo ? (
            <div className="flex flex-col items-center w-full relative z-10">
               {/* Image Preview Container with dynamic scale */}
               <div className="h-48 w-full flex items-center justify-center overflow-hidden relative mb-4">
                  <img 
                    src={logo} 
                    alt="Uploaded logo" 
                    className="object-contain transition-transform duration-200 shadow-lg shadow-black/50 select-none" 
                    style={{ 
                        height: '80%', 
                        transform: `scale(${0.5 + (zoom / 100)})` 
                    }}
                    draggable={false}
                  />
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <p className="text-orange-400 font-bold uppercase tracking-widest text-lg animate-pulse">Drop to Replace</p>
                    </div>
                  )}

                  {/* Shimmer Effect */}
                  {isShimmering && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shimmer" style={{ width: '200%', left: '-50%' }}></div>
                    </div>
                  )}
               </div>
              
              {/* Zoom Controls */}
              <div 
                 className="flex items-center gap-4 bg-zinc-950/90 p-2 rounded-full border border-zinc-700 backdrop-blur-sm z-10 w-full max-w-sm shadow-xl"
                 onClick={(e) => e.stopPropagation()} // Prevent file picker opening
              >
                  <button 
                    onClick={() => adjustZoom(-10)} 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={zoom} 
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-orange-500 w-8 text-right font-bold">{zoom}%</span>

                  <button 
                    onClick={() => adjustZoom(10)} 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-zinc-800 mx-1"></div>

                  <button 
                    onClick={() => setZoom(50)} 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    title="Reset Zoom"
                  >
                    <RefreshCcw className="w-3 h-3" />
                  </button>
              </div>
              
              <div className="flex justify-between w-full max-w-sm px-4 mt-2">
                 <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Subtle Branding</span>
                 <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Bold Branding</span>
              </div>

              {!isDragging && <p className="text-xs text-zinc-500 mt-6 group-hover:text-zinc-300 transition-colors">Click background area to replace logo</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center text-zinc-500 group-hover:text-zinc-300 pointer-events-none relative z-10">
              <Upload className={`w-12 h-12 mb-3 transition-all duration-300 ${isDragging ? 'text-orange-400 scale-125 animate-bounce' : 'text-zinc-600 group-hover:text-orange-500'}`} />
              <p className={`font-bold uppercase tracking-wider transition-all duration-300 ${isDragging ? 'text-orange-400 scale-110' : ''}`}>
                {isDragging ? 'Drop your logo here' : 'Upload Vector / Logo'}
              </p>
              <p className={`text-sm mt-1 transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-60'}`}>PNG or JPG, Transparent</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide border-l-4 border-orange-600 pl-3">3. Forge Specs</h2>
        
        {/* Shadow Configuration Panel */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Shadow Dynamics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Strength */}
                <div className="space-y-3">
                     <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                         <span>Intensity</span>
                         <span className="text-orange-500">{shadowStrength}%</span>
                     </div>
                     <div className="relative flex items-center">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="10"
                            value={shadowStrength} 
                            onChange={(e) => setShadowStrength(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
                        />
                     </div>
                </div>

                {/* Color */}
                <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Tone</div>
                    <div className="flex gap-4">
                        {SHADOW_COLORS.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setShadowColor(c.name)}
                                className={`
                                    w-7 h-7 rounded-full transition-all duration-200 relative
                                    ${c.class}
                                    ${shadowColor === c.name 
                                        ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-zinc-950 scale-110' 
                                        : 'ring-1 ring-zinc-700 hover:ring-zinc-500 hover:scale-105 opacity-80 hover:opacity-100'}
                                `}
                                title={c.name}
                                type="button"
                                aria-label={`Select ${c.name} shadow tone`}
                            />
                        ))}
                    </div>
                </div>

                {/* Direction */}
                <div className="col-span-1 md:col-span-2 space-y-3">
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Cast Direction</div>
                    <div className="grid grid-cols-4 gap-3">
                        {SHADOW_DIRECTIONS.map((dir) => (
                            <button
                                key={dir.id}
                                onClick={() => setShadowDirection(dir.id)}
                                className={`
                                    flex flex-col items-center justify-center py-3 px-1 border transition-all gap-1.5
                                    ${shadowDirection === dir.id 
                                        ? 'bg-orange-600/10 border-orange-500 text-orange-500' 
                                        : 'bg-black border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}
                                `}
                                type="button"
                            >
                                {dir.icon}
                                <span className="text-[9px] font-bold uppercase tracking-wider">{dir.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">
            Additional Environment Instructions
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="E.g. Cyberpunk street lights, matte black finish, dramatic shadows..."
            className="w-full bg-black border border-zinc-800 p-4 text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none h-24 resize-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        {isGenerating ? (
          <ForgeLoader status={status} progress={progress} />
        ) : (
          <Button 
            onClick={handleGenerate} 
            disabled={!logo || selectedProducts.length === 0} 
            className="w-full py-4 text-lg"
          >
            {selectedProducts.length > 1 ? (
                <span className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    INITIATE BATCH FORGE ({selectedProducts.length})
                </span>
            ) : (
                'INITIATE FORGE'
            )}
          </Button>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateX(150%); opacity: 0; }
        }
        .animate-shimmer {
          animation: shimmer 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};