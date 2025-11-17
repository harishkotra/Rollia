
import React from 'react';

interface DiceIconProps {
  className?: string;
}

export const DiceIcon: React.FC<DiceIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625V6.375zM6 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm3 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm4.5-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm1.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      clipRule="evenodd"
    />
  </svg>
);
