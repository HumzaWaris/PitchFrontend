/**
 * Loading Animation Component
 * Displays a progress bar with rotating tips during data processing
 */

import React from 'react';

interface LoadingAnimationProps {
  progress: number;
  tipIndex: number;
  title: string;
  subtitle: string;
  tips: string[];
  colorScheme?: 'cyan' | 'blue';
}

export default function LoadingAnimation({
  progress,
  tipIndex,
  title,
  subtitle,
  tips,
  colorScheme = 'cyan'
}: LoadingAnimationProps) {
  const colors = {
    cyan: {
      primary: 'text-cyan-700',
      secondary: 'text-gray-500',
      tertiary: 'text-gray-400',
      bg: 'bg-cyan-100',
      progress: 'bg-cyan-400',
      icon: '#06b6d4'
    },
    blue: {
      primary: 'text-blue-700',
      secondary: 'text-gray-500',
      tertiary: 'text-gray-400',
      bg: 'bg-blue-100',
      progress: 'bg-blue-400',
      icon: '#0ea5e9'
    }
  };

  const currentColors = colors[colorScheme];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Animated icon */}
      <div className="mb-6 animate-bounce">
        <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" stroke={currentColors.icon} strokeWidth="4" fill="#e0f2fe" />
          <path d="M32 20v16l12 6" stroke={currentColors.icon} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      {/* Progress bar */}
      <div className={`w-64 h-4 ${currentColors.bg} rounded-full overflow-hidden mb-4`}>
        <div
          className={`h-full ${currentColors.progress} transition-all duration-100`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Status text */}
      <div className={`text-lg font-semibold ${currentColors.primary} mb-2`}>
        {title}
      </div>
      <div className={`${currentColors.secondary} mb-2`}>
        {tips[tipIndex]}
      </div>
      <div className={`${currentColors.tertiary} text-sm`}>
        {subtitle}
      </div>
    </div>
  );
} 