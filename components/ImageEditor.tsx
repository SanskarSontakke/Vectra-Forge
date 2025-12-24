import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { editImage } from '../services/geminiService';
import { Button } from './ui/Button';
import { ForgeLoader } from './ui/ForgeLoader';
import { Wand2, Image as ImageIcon, ArrowRight, Undo, Redo, RotateCcw, Layers } from 'lucide-react';

interface ImageEditorProps {
  initialImages?: GeneratedImage[];
  onImageGenerated: (img: GeneratedImage) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ initialImages = [], onImageGenerated }) => {
  // Batch Mode Detection
  const isBatchMode = initialImages.length > 1;

  // Single Edit State
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // General State
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when props change
  useEffect(() => {
    if (!isBatchMode && initialImages.length === 1) {
       // Single Image Mode
       const img = initialImages[0];
       // Only reset if it's a new image ID
       if (history.length === 0 || history[0] !== img.url) {
         setHistory([img.url]);
         setCurrentIndex(0);
         setPrompt('');
       }
    } else if (isBatchMode) {
        // Batch Mode Reset
        setPrompt('');
    }
  }, [initialImages, isBatchMode]);

  // Derived current image for single mode
  const sourceImage = !isBatchMode && currentIndex >= 0 && history[currentIndex] ? history[currentIndex] : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !isBatchMode) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setHistory([result]);
        setCurrentIndex(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSingleEdit = async () => {
    if (!sourceImage || !prompt) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStatus('Reading Source Matrix...');
    
    // Simulate steps for UI feedback
    const statusInterval = setInterval(() => {
        setStatus(prev => {
             if (prev === 'Reading Source Matrix...') return 'Deconstructing Pixels...';
             if (prev === 'Deconstructing Pixels...') return 'Interpreting Mutation Prompt...';
             if (prev === 'Interpreting Mutation Prompt...') return 'Applying Generative Transformation...';
             if (prev === 'Applying Generative Transformation...') return 'Reassembling Image Data...';
             return prev;
        })
    }, 2000);

    const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.floor(Math.random() * 5) + 2, 95));
    }, 400);

    try {
      const resultBase64 = await editImage(sourceImage, prompt);
      
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(resultBase64);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: resultBase64,
        prompt: `Edit: ${prompt}`,
        createdAt: Date.now(),
        type: 'edit'
      };
      
      setProgress(100);
      setStatus('Mutation Complete');
      await new Promise(resolve => setTimeout(resolve, 500));
      onImageGenerated(newImage);

    } catch (error) {
      alert("Failed to edit image. Try a different prompt.");
    } finally {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleBatchEdit = async () => {
    if (!prompt || initialImages.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus(`Initializing Batch Protocol (${initialImages.length} Items)...`);

    try {
        const total = initialImages.length;
        let completed = 0;

        // Process sequentially to handle rate limits gracefully, or parallel if confident.
        // Let's do parallel for "Forge" speed feeling.
        const promises = initialImages.map(async (img) => {
            try {
                const resultBase64 = await editImage(img.url, prompt);
                completed++;
                setProgress((completed / total) * 95);
                
                const newImage: GeneratedImage = {
                    id: Date.now().toString() + Math.random().toString(36).substring(7),
                    url: resultBase64,
                    prompt: `Batch Edit: ${prompt}`,
                    createdAt: Date.now(),
                    type: 'edit'
                };
                onImageGenerated(newImage);
                return true;
            } catch (e) {
                console.error("Batch item failed", e);
                return false;
            }
        });

        // Status update loop
        const statusInterval = setInterval(() => {
            setStatus(`Processing Batch Matrix... ${(completed / total * 100).toFixed(0)}%`);
        }, 500);

        await Promise.all(promises);
        clearInterval(statusInterval);
        
        setProgress(100);
        setStatus('Batch Sequence Complete');
        await new Promise(resolve => setTimeout(resolve, 800));

    } catch (error) {
        alert("Batch processing encountered errors.");
    } finally {
        setIsProcessing(false);
        setProgress(0);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleReset = () => {
     if (history.length > 0) setCurrentIndex(0);
  };

  return (
    <div className="space-y-8 p-6 bg-zinc-900 border border-zinc-800 shadow-2xl">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
        <div className={`p-2 rounded-none transform rotate-3 ${isBatchMode ? 'bg-indigo-600' : 'bg-orange-600'}`}>
          {isBatchMode ? <Layers className="w-6 h-6 text-white" /> : <Wand2 className="w-6 h-6 text-white" />}
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {isBatchMode ? 'Batch Mutation Forge' : 'Refine Forge'}
          </h2>
          <p className="text-zinc-500 text-sm font-mono">
            {isBatchMode ? `PROCESSING ${initialImages.length} ARTIFACTS` : 'GEMINI 2.5 FLASH IMAGE CORE'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Source Image Area */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
             <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider">Source Material</label>
             
             {/* History Controls (Only for Single Mode) */}
             {!isBatchMode && (
                 <div className="flex items-center gap-1">
                    <button 
                      onClick={handleReset}
                      disabled={currentIndex <= 0}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Reset to Original"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                    <button 
                      onClick={handleUndo}
                      disabled={currentIndex <= 0}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Undo"
                    >
                      <Undo className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleRedo}
                      disabled={currentIndex >= history.length - 1}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Redo"
                    >
                      <Redo className="w-4 h-4" />
                    </button>
                 </div>
             )}
          </div>

          <div 
            onClick={() => !isProcessing && !isBatchMode && fileInputRef.current?.click()}
            className={`
              relative group overflow-hidden bg-black border-2 border-dashed
              flex flex-col items-center justify-center transition-all min-h-[300px]
              ${isBatchMode ? 'border-indigo-500/50 cursor-default' : 'cursor-pointer border-zinc-800 hover:border-zinc-600'}
              ${sourceImage && !isBatchMode ? 'border-orange-500/50' : ''}
              ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            {isBatchMode ? (
                // Batch View - Grid of Thumbnails
                <div className="w-full h-full p-4 overflow-y-auto max-h-[400px]">
                    <div className="grid grid-cols-3 gap-2">
                        {initialImages.map((img) => (
                            <div key={img.id} className="aspect-square bg-zinc-900 border border-zinc-800 relative">
                                <img src={img.url} className="w-full h-full object-cover opacity-70" alt="batch source" />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-lg">
                            {initialImages.length} Items Queued
                        </span>
                    </div>
                </div>
            ) : (
                // Single View
                <>
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                    />
                    {sourceImage ? (
                    <>
                        <img src={sourceImage} alt="Source" className="w-full h-full object-contain max-h-[400px]" />
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-orange-500 font-bold uppercase tracking-wider">Replace Source</p>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800 backdrop-blur-sm pointer-events-none">
                        Step {currentIndex + 1}/{history.length}
                        </div>
                    </>
                    ) : (
                    <div className="text-zinc-600 flex flex-col items-center group-hover:text-zinc-400">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p className="font-bold uppercase">Select Image</p>
                    </div>
                    )}
                </>
            )}
          </div>
        </div>

        {/* Prompt & Action */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">
              {isBatchMode ? 'Batch Mutation Instructions' : 'Mutation Instructions'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isProcessing}
              placeholder={isBatchMode 
                ? "E.g. 'Convert all to grayscale', 'Add snowfall effect', 'Apply cyberpunk filter'..."
                : "E.g., 'Add a neon glow', 'Make it look rusty', 'Change background to factory'..."}
              className={`w-full bg-black border p-4 text-white outline-none h-40 resize-none font-mono text-sm placeholder:text-zinc-700 disabled:opacity-50 transition-colors
                ${isBatchMode ? 'border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' : 'border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'}
              `}
            />
          </div>
          
          {isProcessing ? (
             <ForgeLoader status={status} progress={progress} />
          ) : (
            <Button 
              onClick={isBatchMode ? handleBatchEdit : handleSingleEdit} 
              disabled={(!isBatchMode && !sourceImage) || !prompt} 
              className={`w-full py-4 text-lg ${isBatchMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : ''}`}
            >
              {isBatchMode ? (
                  <span className="flex items-center gap-2">
                      <Layers className="w-5 h-5" /> EXECUTE BATCH MUTATION
                  </span>
              ) : (
                  <span className="flex items-center gap-2">
                       EXECUTE MUTATION <ArrowRight className="w-5 h-5" />
                  </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};