import React, { useState } from 'react';
import { Tab, GeneratedImage } from './types';
import { MockupStudio } from './components/MockupStudio';
import { ImageEditor } from './components/ImageEditor';
import { HistorySidebar } from './components/HistorySidebar';
import { Wand2, Hammer, Download } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('mockup');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  // State for batch editing
  const [batchImages, setBatchImages] = useState<GeneratedImage[]>([]);

  const handleImageGenerated = (img: GeneratedImage) => {
    setHistory(prev => [img, ...prev]);
    // If we are in batch mode, we don't necessarily want to jump to every single new image
    // but updating the selected image to the latest one is fine for visual feedback.
    setSelectedImage(img);
  };

  const handleSelectImage = (img: GeneratedImage) => {
    setSelectedImage(img);
    // Clearing batch images when a single image is selected ensures the editor goes back to single mode
    setBatchImages([]);
  };

  const handleBatchEdit = (images: GeneratedImage[]) => {
    setBatchImages(images);
    setActiveTab('editor');
    // We can also clear the main selected image preview or set it to the first of the batch
    if (images.length > 0) setSelectedImage(images[0]);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'mockup', label: 'Mockup Forge', icon: <Hammer className="w-4 h-4" /> },
    { id: 'editor', label: 'Refine / Edit', icon: <Wand2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-1.5 transform -rotate-6 shadow-[0_0_10px_rgba(234,88,12,0.5)]">
               {/* Diamond logo representing a vector anchor point */}
               <div className="w-5 h-5 border-2 border-white transform rotate-45"></div>
            </div>
            <h1 className="text-xl font-black italic tracking-tighter text-white">
              VECTRA<span className="text-orange-600">FORGE</span>
            </h1>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex bg-zinc-900 border border-zinc-800 p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'editor' && batchImages.length > 0) {
                     // Keep batch state if clicking editor manually while in batch mode
                  } else if (tab.id === 'mockup') {
                     // Maybe clear batch if leaving editor? Let's keep it flexible for now.
                  }
                }}
                className={`
                  flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all
                  ${activeTab === tab.id 
                    ? 'bg-zinc-800 text-white border-b-2 border-orange-500' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-b-2 border-transparent'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="w-8" />
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-12 pb-20">
            
            {/* Feature Components (Input Area) */}
            <div className="animate-in fade-in duration-300 slide-in-from-top-4">
              {activeTab === 'mockup' && (
                <MockupStudio onImageGenerated={handleImageGenerated} />
              )}
              {activeTab === 'editor' && (
                <ImageEditor 
                  initialImages={batchImages.length > 0 ? batchImages : (selectedImage ? [selectedImage] : [])} 
                  onImageGenerated={handleImageGenerated} 
                />
              )}
            </div>

            {/* Display Active Selection Result (Moved to bottom) */}
            {selectedImage && (
              <div className="border-t border-zinc-800 pt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    <span className="w-3 h-8 bg-orange-600 inline-block skew-x-[-12deg]"></span>
                    Forge Output
                  </h3>
                  <div className="flex gap-3">
                     {activeTab !== 'editor' && (
                        <button 
                          onClick={() => {
                              setBatchImages([]); // Ensure single mode
                              setSelectedImage(selectedImage);
                              setActiveTab('editor');
                          }}
                          className="text-xs font-bold text-zinc-400 hover:text-orange-500 flex items-center gap-2 uppercase tracking-wide border border-zinc-700 px-3 py-1.5 hover:border-orange-500 transition-colors"
                        >
                          <Wand2 className="w-3 h-3" /> Use in Editor
                        </button>
                     )}
                     <a 
                        href={selectedImage.url} 
                        download={`vectraforge-${selectedImage.id}.png`}
                        className="text-xs font-bold bg-white text-black hover:bg-zinc-200 flex items-center gap-2 uppercase tracking-wide px-4 py-1.5 transition-colors"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                  </div>
                </div>
                
                <div className="bg-zinc-900 p-2 border border-zinc-700 shadow-2xl relative">
                  {/* Checkerboard background for transparency */}
                  <div className="absolute inset-2 bg-[linear-gradient(45deg,#18181b_25%,transparent_25%,transparent_75%,#18181b_75%,#18181b),linear-gradient(45deg,#18181b_25%,transparent_25%,transparent_75%,#18181b_75%,#18181b)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] bg-zinc-950 opacity-100 h-[calc(100%-1rem)] w-[calc(100%-1rem)] pointer-events-none z-0"></div>
                  
                  <img 
                    src={selectedImage.url} 
                    alt="Current Result" 
                    className="relative z-10 w-full max-h-[700px] object-contain mx-auto" 
                  />
                  
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm p-4 border border-zinc-800 flex items-start justify-between z-20">
                     <p className="font-mono text-xs text-zinc-300 line-clamp-2 w-3/4">
                       &gt; {selectedImage.prompt}
                     </p>
                     <span className="text-[10px] font-bold text-orange-500 uppercase border border-orange-500/30 px-2 py-1">
                       {selectedImage.type}
                     </span>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>

      {/* Right Sidebar (History) */}
      <div className="hidden lg:block h-full border-l border-zinc-800 bg-zinc-950 w-72 shrink-0 z-20">
        <HistorySidebar 
          images={history} 
          onSelect={handleSelectImage}
          onBatchEdit={handleBatchEdit}
        />
      </div>

    </div>
  );
};

export default App;