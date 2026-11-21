import React from 'react';
import { PollutionCategory } from '../../../shared/types.js';

interface AqiBadgeProps {
  category: PollutionCategory;
  aqi?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AqiBadge: React.FC<AqiBadgeProps> = ({ category, aqi, size = 'md' }) => {
  const getBadgeStyles = () => {
    switch (category) {
      case 'Good':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Satisfactory':
        return 'bg-lime-100 text-lime-900 border-lime-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Poor':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Very Poor':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'Severe':
        return 'bg-rose-900 text-white border-rose-950 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${getBadgeStyles()} ${sizeClasses}`}
      role="status"
      aria-label={`Air Quality Category: ${category}${aqi ? `, AQI ${aqi}` : ''}`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-80" aria-hidden="true" />
      {category}
      {typeof aqi === 'number' && <span className="opacity-75 font-mono">({aqi})</span>}
    </span>
  );
};
