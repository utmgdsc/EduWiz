import React, { useRef, useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFocusChange: (focused: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onFocusChange }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pulsing, setPulsing] = useState(true);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Example search placeholders that will cycle
  const searchPlaceholders = [
    "Learn Anything",
    "Learn quantum physics",
    "Discover mathematical concepts",
    "Master programming languages",
    "Understand climate science"
  ];

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Initial attention-grabbing pulse animation
  useEffect(() => {
    // Initial pulse animation when component mounts
    const pulseTimer = setTimeout(() => {
      setPulsing(false);
    }, 2000);
    
    // Initialize the first placeholder
    setCurrentPlaceholder(searchPlaceholders[0]);
    
    return () => clearTimeout(pulseTimer);
  }, []);

  // Placeholder text animation effect
  useEffect(() => {
    let currentIndex = 0;
    
    const animatePlaceholder = () => {
      // Start transition out
      setIsTransitioning(true);
      
      // After fading out, change the text and fade back in
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % searchPlaceholders.length;
        setCurrentPlaceholder(searchPlaceholders[currentIndex]);
        setIsTransitioning(false);
      }, 500); // Half of our total transition time
    };
    
    // Set the interval for changing placeholders
    const placeholderInterval = setInterval(animatePlaceholder, 3000);
    
    return () => clearInterval(placeholderInterval);
  }, []);

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={`
            w-full px-6 py-3 
            bg-black/50 backdrop-blur-sm 
            border border-gray-700 rounded-full 
            text-white
            focus:outline-none focus:border-blue-400 
            focus:shadow-[0_0_15px_rgba(0,170,255,0.5)] 
            transition-all duration-300
            ${pulsing ? 'animate-pulse-glow' : ''}
          `}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e);
            }
          }}
        />
        
        {/* Custom placeholder text with transition effect - only shows when input is empty */}
        {inputValue === '' && (
          <div 
            className={`
              absolute left-6 top-1/2 transform -translate-y-1/2
              pointer-events-none text-gray-500
              transition-opacity duration-500 ease-in-out
              ${isTransitioning ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {currentPlaceholder}...
          </div>
        )}
        
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-800 transition-colors text-gray-500"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12H13M13 12L17 8M13 12L17 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;