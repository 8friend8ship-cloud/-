import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center" 
      onMouseEnter={() => setIsVisible(true)} 
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur border border-gray-700 text-gray-200 text-xs rounded-md shadow-xl whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none select-none`}
        >
          {content}
          {/* Arrow */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 ${position === 'top' ? '-bottom-1 border-t-0 border-l-0 bg-gray-900' : '-top-1 border-b-0 border-r-0 rotate-[225deg]'}`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;