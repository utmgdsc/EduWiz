import React from 'react';

interface TitleComponentProps {
  setHoveredElement: (element: string | null) => void;
}

const TitleComponent: React.FC<TitleComponentProps> = ({ setHoveredElement }) => {
  return (
    <div className="text-center mb-12 w-full px-4">
      <h1 
        className={`
          font-bold tracking-tighter text-neutral-200 
          transition-all duration-500 ease-in-out
          hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]
          
          /* Responsive text sizing */
          text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
          
          /* Permanent glowing shadow */
          drop-shadow-[0_0_12px_rgba(150,150,255,0.56)]
        `}
        onMouseEnter={() => setHoveredElement('title')}
        onMouseLeave={() => setHoveredElement(null)}
      >
        EduWiz
      </h1>
    </div>
  );
};

export default TitleComponent;