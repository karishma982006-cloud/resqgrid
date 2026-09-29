import React from 'react';

export const PriorityBadge = ({ level = 'MEDIUM', score = null, showScore = false }) => {
  const normalized = (level || 'MEDIUM').toUpperCase();

  const styles = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-300 font-semibold',
    HIGH: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
    MEDIUM: 'bg-yellow-50 text-yellow-800 border-yellow-300 font-medium',
    LOW: 'bg-slate-50 text-slate-700 border-slate-300 font-normal'
  };

  const currentStyle = styles[normalized] || styles.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        normalized === 'CRITICAL' ? 'bg-red-600' :
        normalized === 'HIGH' ? 'bg-amber-600' :
        normalized === 'MEDIUM' ? 'bg-yellow-600' : 'bg-slate-500'
      }`}></span>
      <span>{normalized}</span>
      {showScore && score !== null && (
        <span className="text-[10px] opacity-75 font-mono">({score})</span>
      )}
    </span>
  );
};

export default PriorityBadge;
