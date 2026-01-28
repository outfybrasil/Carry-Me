
import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 120 }) => {
  const normalizedScore = (score + 100) / 2;
  const radius = size * 0.4;
  const strokeWidth = size * 0.1;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (220 / 360);
  const strokeDashoffset = arcLength - (normalizedScore / 100) * arcLength;

  let color = 'text-slate-700';
  if (score >= 80) color = 'text-[#ffb800]';
  else if (score >= 20) color = 'text-green-500';
  else if (score >= -20) color = 'text-slate-500';
  else color = 'text-[#ff4343]';

  return (
    <div className="relative flex flex-col items-center justify-center p-2 bg-black/40 rounded-sm border border-white/5" style={{ width: size, height: size }}>
      <svg className="transform rotate-[160deg]" width={size} height={size}>
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out drop-shadow-[0_0_8px_currentColor]`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-1">
        <span className={`block text-3xl font-mono font-black ${color} tracking-tighter`}>{score}</span>
        <span className="text-[8px] text-slate-700 font-mono font-black uppercase tracking-[0.3em]">REP_INDEX</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
