import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 120 }) => {
  // Normalize score (-100 to 100) to percentage (0 to 100) for the gauge
  const normalizedScore = (score + 100) / 2;
  
  const radius = size * 0.4;
  const strokeWidth = size * 0.1;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  // We only want a semi-circle (or slightly more), let's do 220 degrees arc
  const arcLength = circumference * (220 / 360);
  const strokeDashoffset = arcLength - (normalizedScore / 100) * arcLength;
  
  // Color determination
  let color = 'text-slate-400';
  if (score >= 80) color = 'text-blue-400';
  else if (score >= 20) color = 'text-teal-400';
  else if (score >= -20) color = 'text-yellow-400';
  else color = 'text-red-500';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform rotate-[160deg]" width={size} height={size}>
        {/* Background Track */}
        <circle
          className="text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-2">
        <span className={`block text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Rep</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
