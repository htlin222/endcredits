import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, MoreVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const sampleMarkdown = `# Cast
* John Smith as Hero
* Jane Doe as Heroine
* Bob Wilson as Villain

# Crew
* Director: James Cameron
* Producer: Steven Spielberg
* Writer: Christopher Nolan

# Special Thanks
* Coffee Machine
* Pizza Delivery
* Stack Overflow`;

const CreditsRoll = () => {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [startOffset, setStartOffset] = useState(25);
  const [currentPosition, setCurrentPosition] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [hue, setHue] = useState(0); // 0-360 degrees
  const [fontSize, setFontSize] = useState(100); // percentage of base size
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [markdown]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdown(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      // When pausing, capture the current position
      const element = containerRef.current;
      if (element) {
        const style = window.getComputedStyle(element);
        const matrix = new WebKitCSSMatrix(style.transform);
        const currentY = (matrix.m42 / element.parentElement.offsetHeight) * 100;
        setCurrentPosition(currentY);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
  };

  const handleOffsetChange = (e) => {
    const newOffset = parseInt(e.target.value);
    setStartOffset(newOffset);
  };

  const handleHueChange = (e) => {
    setHue(parseInt(e.target.value));
  };

  const handleFontSizeChange = (e) => {
    setFontSize(parseInt(e.target.value));
  };

  const handleAnimationEnd = () => {
    setIsPlaying(false);
  };

  const renderMarkdown = (text) => {
    const baseTextSize = fontSize / 100;
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <h1 
            key={index} 
            style={{ 
              fontSize: `${3 * baseTextSize}rem`,
              filter: `hue-rotate(${hue}deg)`
            }} 
            className="font-bold mt-12 mb-6 text-white"
          >
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('* ')) {
        return (
          <p 
            key={index} 
            style={{ 
              fontSize: `${1.125 * baseTextSize}rem`,
              filter: `hue-rotate(${hue}deg)`
            }} 
            className="my-6 text-white"
          >
            {line.slice(2)}
          </p>
        );
      }
      return (
        <p 
          key={index} 
          style={{ 
            fontSize: `${1.125 * baseTextSize}rem`,
            filter: `hue-rotate(${hue}deg)`
          }} 
          className="text-white"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => {
            setIsPlaying(false);
            setStartOffset(25);  // Reset to default value
            if (containerRef.current) {
              containerRef.current.style.animation = 'none';
              containerRef.current.offsetHeight; // Force reflow
              containerRef.current.style.transform = `translateY(25%)`;
              requestAnimationFrame(() => {
                if (containerRef.current) {
                  containerRef.current.style.animation = `scroll-up ${20 / speed}s linear forwards`;
                  containerRef.current.style.animationPlayState = 'paused';
                }
              });
            }
          }}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          title="Reload"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
        </button>
        <button
          onClick={togglePlay}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
        >
          {isPlaying ? <Pause className="text-white" size={24} /> : <Play className="text-white" size={24} />}
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
        >
          <MoreVertical className="text-white" size={24} />
        </button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <label className="flex flex-col gap-2">
                <span>Text Color (Hue)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={handleHueChange}
                    className="w-full"
                  />
                  <span className="min-w-[4ch]">{hue}°</span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span>Font Size</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="w-full"
                  />
                  <span className="min-w-[4ch]">{fontSize}%</span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="flex justify-between">
                  <span>Starting Position</span>
                  <span className="text-gray-400 text-sm">Controls where credits begin</span>
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={startOffset}
                    onChange={handleOffsetChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    title={`${startOffset}%`}
                  />
                  <span className="min-w-[4ch] text-gray-300">{startOffset}%</span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span>Scroll Speed</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={handleSpeedChange}
                    className="w-full"
                  />
                  <span className="min-w-[3ch]">{speed}x</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors w-full">
                <Upload size={20} />
                <span>Upload Markdown File</span>
                <input
                  type="file"
                  accept=".md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credits container */}
      <div 
        className="flex-1 overflow-hidden relative"
        onWheel={(e) => {
          if (!isPlaying) {
            const delta = e.deltaY > 0 ? 2 : -2;
            const newOffset = Math.max(0, Math.min(200, startOffset + delta));
            setStartOffset(newOffset);
            if (containerRef.current) {
              containerRef.current.style.animation = 'none';
              containerRef.current.offsetHeight; // Force reflow
              containerRef.current.style.transform = `translateY(${newOffset}%)`;
              requestAnimationFrame(() => {
                if (containerRef.current) {
                  containerRef.current.style.animation = `scroll-up ${20 / speed}s linear forwards`;
                  containerRef.current.style.animationPlayState = 'paused';
                }
              });
            }
          }
        }}
      >
        <div
          ref={containerRef}
          className="absolute w-full text-center px-4"
          style={{
            animation: `scroll-up ${20 / speed}s linear forwards`,
            animationPlayState: isPlaying ? 'running' : 'paused',
            transform: containerRef.current?.style.animation === 'none' ? `translateY(${startOffset}%)` : undefined
          }}
          onAnimationEnd={handleAnimationEnd}
        >
          <div ref={contentRef}>
            {renderMarkdown(markdown)}
          </div>
          <div className="h-24" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(${startOffset}%);
          }
          100% {
            transform: translateY(-${contentHeight + 96}px);
          }
        }
      `}</style>
    </div>
  );
};

export default CreditsRoll;