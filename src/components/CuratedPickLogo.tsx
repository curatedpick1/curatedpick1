import React from 'react';

interface CuratedPickLogoProps {
  className?: string;
  size?: number | string;
}

export const CuratedPickLogo: React.FC<CuratedPickLogoProps> = ({
  className = 'w-8 h-8',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="The Curated Pick Logo"
    >
      {/* Shopping Bag Handle */}
      <path
        d="M 40 34 C 40 19, 60 19, 60 34"
        className="stroke-[#041a38] dark:stroke-slate-100 transition-colors"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shopping Bag Body */}
      <path
        d="M 33 34 L 67 34 C 69.8 34, 71.9 36, 72.2 38.8 L 75.3 78.2 C 75.8 83.5, 71.6 88, 66.3 88 L 33.7 88 C 28.4 88, 24.2 83.5, 24.7 78.2 L 27.8 38.8 C 28.1 36, 30.2 34, 33 34 Z"
        className="stroke-[#041a38] dark:stroke-slate-100 transition-colors"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vibrant Cyan Pick / Checkmark */}
      <path
        d="M 38 54 L 49 66 L 71 29"
        stroke="#00bcd4"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-[#00bcd4] dark:stroke-[#26fedc]"
      />
    </svg>
  );
};
