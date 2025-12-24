import React, { useState, useEffect } from 'react';
import { ImageSize, GeneratedImage } from '../types';
import { generateProImage, checkAndRequestApiKey, openApiKeySelector } from '../services/geminiService';
import { Button } from './ui/Button';
import { ForgeLoader } from './ui/ForgeLoader';
import { Sparkles, Key } from 'lucide-react';

interface ProGeneratorProps {
  onImageGenerated: (img: GeneratedImage) => void;
}

export const ProGenerator: React.FC<ProGeneratorProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Size_1K);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const keySelected = await checkAndRequestApiKey();
    setHasKey(keySelected);
  };

  const handleConnectKey = async () => {
    await openApiKeySelector();
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setProgress(0);
    setStatus('Establishing Neural Uplink...');

    // Pro usually takes longer, so slower progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.floor(Math.random() * 2) + 1, 98));
    }, 600);

    const statusInterval = setInterval(() => {
        setStatus(prev => {
             if (prev === 'Establishing Neural Uplink...') return 'Allocating High-Fidelity Resources...';
             if (prev === 'Allocating High-Fidelity Resources...') return 'Generating 4K Texture Maps...';
             if (prev === 'Generating 4K Texture Maps...') return 'Synthesizing Detail Layers...';
             if (prev === 'Synthesizing Detail Layers...') return 'Finalizing Render Output...';
             return prev;
        })
    }, 3000);

    try {
      const resultBase64 = await generateProImage(prompt, size);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: resultBase64,
        prompt: `Pro Gen (${size}): ${prompt}`,
        createdAt: Date.now(),
        type: 'pro-gen'
      };
      
      setProgress(100);
      setStatus('Render Complete');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onImageGenerated(newImage);
    } catch (error: any) {
      if (error.message?.includes('Requested entity was not found')) {
         setHasKey(false);
         alert("API Key issue. Please select your paid API key again.");
      } else {
        alert("Generation failed. Ensure you have selected a valid paid project key.");
      }
    } finally {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8 bg-zinc-900 rounded-none border border-zinc-800 text-center shadow-2xl">
        <div className="bg-yellow-500/10 p-4 rounded-full mb-6">
          <Key className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Paid API Key Required</h2>
        <p className="text-zinc-400 max-w-md mb-8 font-mono text-sm">
          Generating high-fidelity 4K images with Nano Banana Pro requires a paid API key from a Google Cloud Project.
        </p>
        <div className="space-y-4">
          <Button onClick={handleConnectKey} variant="primary" className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-[0_0_15px_rgba(202,138,4,0.3)]">
            Select API Key
          </Button>
          <div className="text-sm">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
               View Billing Documentation
             </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-zinc-900 border border-zinc-800 shadow-2xl">
      <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-4">
        <div className="p-2 bg-yellow-500/20 rounded-none transform -rotate-3">
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Pro Generator</h2>
          <p className="text-zinc-500 text-sm font-mono">GEMINI 3 PRO IMAGE PREVIEW</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">
            Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe the image you want to generate in detail..."
            className="w-full bg-black border border-zinc-800 p-4 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none h-32 resize-none font-mono text-sm placeholder:text-zinc-700 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">
            Image Resolution
          </label>
          <div className={`grid grid-cols-3 gap-4 ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
            {Object.values(ImageSize).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`
                  py-3 border text-center font-bold uppercase tracking-wider transition-all
                  ${size === s 
                    ? 'bg-yellow-600 border-yellow-500 text-white shadow-[0_0_15px_rgba(202,138,4,0.3)]' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {isGenerating ? (
            <ForgeLoader status={status} progress={progress} />
        ) : (
            <Button 
            onClick={handleGenerate} 
            disabled={!prompt} 
            className="w-full py-4 text-lg bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 border-none shadow-[0_0_15px_rgba(202,138,4,0.3)]"
            >
            GENERATE HIGH-FIDELITY IMAGE
            </Button>
        )}
      </div>
    </div>
  );
};