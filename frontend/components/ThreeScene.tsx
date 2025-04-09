'use client'
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import ThreeJSBackground from './ThreeJSBackground';
import TitleComponent from './TitleComponent';
import SearchBar from './SearchBar';
const LandingPage: React.FC = () => {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (searchQuery) {
      router.push(`/learn?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Three.js canvas */}
      <ThreeJSBackground 
        mountRef={mountRef} 
        isSearchFocused={isSearchFocused} 
        hoveredElement={hoveredElement} 
      />
      
      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center h-full">
        <TitleComponent 
          setHoveredElement={setHoveredElement} 
        />
        
        {/* Search input */}
        <div className="w-full max-w-lg px-4">
          <SearchBar 
            onSearch={handleSearch}
            onFocusChange={setIsSearchFocused}
          />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
