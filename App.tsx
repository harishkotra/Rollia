import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PROMPTS } from './constants';
import { DiceIcon } from './components/DiceIcon';
import { SettingsIcon } from './components/SettingsIcon';
import { HeartIcon } from './components/HeartIcon';
import { ShareIcon } from './components/ShareIcon';
import { CloseIcon } from './components/CloseIcon';
import { TrashIcon } from './components/TrashIcon';

// --- UTILITY FUNCTIONS & HOOKS ---

// Haptic feedback utility
const triggerHaptic = (pattern: VibratePattern = 50) => {
  if (window.navigator && 'vibrate' in window.navigator) {
    window.navigator.vibrate(pattern);
  }
};

// A simple local storage hook
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = JSON.stringify(storedValue);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}


// --- CHILD COMPONENTS ---

const AnimatedPrompt: React.FC<{ text: string }> = ({ text }) => {
  // Use a key derived from the text to force re-render and re-animate on change
  return (
    <p key={text} className="text-2xl sm:text-3xl leading-relaxed text-gray-100">
      {text.split(' ').map((word, index) => (
        <span
          key={index}
          className="inline-block animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {word}&nbsp;
        </span>
      ))}
    </p>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  
  const [favorites, setFavorites] = useLocalStorage<string[]>('reflection-dice-favorites', []);
  const [rollDuration, setRollDuration] = useLocalStorage<number>('reflection-dice-duration', 1000);
  
  const previousPromptRef = useRef<string | null>(null);

  useEffect(() => {
    setShowShare(!!(navigator.share));
  }, []);

  const handleRoll = useCallback(() => {
    if (isRolling) return;

    triggerHaptic(100);
    setIsRolling(true);
    setPrompt(null);

    setTimeout(() => {
      let newPrompt: string;
      do {
        newPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      } while (newPrompt === previousPromptRef.current && PROMPTS.length > 1);

      previousPromptRef.current = newPrompt;
      setPrompt(newPrompt);
      setIsRolling(false);
      triggerHaptic([50, 50]);
    }, rollDuration);
  }, [isRolling, rollDuration]);

  const handleShare = useCallback(async () => {
    if (prompt && navigator.share) {
      try {
        await navigator.share({
          title: 'Reflection Dice Prompt',
          text: `Here's a thoughtful prompt: "${prompt}"`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  }, [prompt]);

  const handleFavoriteToggle = useCallback(() => {
    if (!prompt) return;
    triggerHaptic(20);
    setFavorites(prev =>
      prev.includes(prompt!)
        ? prev.filter(p => p !== prompt)
        : [...prev, prompt!]
    );
  }, [prompt, setFavorites]);

  const removeFavorite = (promptToRemove: string) => {
    setFavorites(prev => prev.filter(p => p !== promptToRemove));
    triggerHaptic(20);
  };
  
  const isCurrentPromptFavorite = prompt ? favorites.includes(prompt) : false;

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-black text-gray-100 p-6 sm:p-8 font-sans antialiased overflow-hidden">
      
      <header className="flex justify-between items-center w-full max-w-2xl mx-auto">
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Reflection Dice</h1>
          <p className="text-gray-500 mt-2 text-lg">Your daily moment of mindfulness</p>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-neutral-800 transition-colors" aria-label="Open Settings">
          <SettingsIcon className="w-7 h-7 text-gray-400" />
        </button>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow w-full max-w-2xl text-center my-8">
        <div className="relative w-full h-72 sm:h-80 flex items-center justify-center p-4">
          {/* Prompt Card */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out
              ${prompt && !isRolling ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            {prompt && (
              <div className="relative bg-neutral-900/75 backdrop-blur-md border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full flex flex-col min-h-[16rem] sm:min-h-[18rem]">
                <div className="flex-grow flex items-center justify-center">
                    <AnimatedPrompt text={prompt} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button onClick={handleFavoriteToggle} aria-label="Toggle Favorite" className="p-2 text-gray-500 hover:text-white transition-colors">
                    <HeartIcon className={`w-6 h-6 ${isCurrentPromptFavorite ? 'text-white' : ''}`} isFilled={isCurrentPromptFavorite} />
                  </button>
                  {showShare && (
                     <button onClick={handleShare} aria-label="Share Prompt" className="p-2 text-gray-500 hover:text-white transition-colors">
                       <ShareIcon className="w-6 h-6" />
                     </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Initial/Loading Text */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out
              ${!prompt || isRolling ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="text-xl sm:text-2xl text-gray-600 px-4">
              {isRolling ? 'Rolling...' : 'Roll for your mental reset'}
            </p>
          </div>
        </div>
      </main>
      
      <footer className="w-full flex flex-col items-center">
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="group flex items-center justify-center gap-3 w-full max-w-xs bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-white/5 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
        >
          <DiceIcon 
            className={`w-8 h-8 transition-transform duration-300 ease-in-out
            ${isRolling ? 'animate-spin' : 'group-hover:rotate-12'}`} 
            style={{ animationDuration: isRolling ? `${rollDuration}ms` : '' }}
          />
          <span className="text-xl">{isRolling ? 'Rolling...' : 'Roll the Dice'}</span>
        </button>
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in-up" 
          style={{animationDuration: '300ms'}}
          onClick={() => setIsSettingsOpen(false)}
        >
          <div className="bg-neutral-900 rounded-2xl w-full max-w-md border border-neutral-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-neutral-700">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full hover:bg-neutral-800" aria-label="Close Settings">
                <CloseIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="roll-duration" className="block text-sm font-medium text-gray-300 mb-2">
                  Roll Animation: {rollDuration / 1000}s
                </label>
                <input
                  id="roll-duration"
                  type="range"
                  min="500"
                  max="2000"
                  step="100"
                  value={rollDuration}
                  onChange={e => setRollDuration(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Favorites</h3>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {favorites.length > 0 ? (
                    favorites.map((fav, index) => (
                      <div key={index} className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-lg">
                        <p className="text-gray-200 text-left flex-1">{fav}</p>
                        <button onClick={() => removeFavorite(fav)} className="p-1 text-gray-500 hover:text-red-500 ml-2" aria-label="Remove Favorite">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">You have no favorite prompts yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;