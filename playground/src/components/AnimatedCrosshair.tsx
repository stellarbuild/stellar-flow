interface AnimatedCrosshairProps {
  size?: number;
  className?: string;
}

export function AnimatedCrosshair({ size = 20, className = '' }: AnimatedCrosshairProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Primary Crosshairs */}
      <path
        d="M50 5 L50 95 M5 50 L95 50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      {/* Precision Reticle Circle */}
      <circle
        cx="50"
        cy="50"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      {/* 45-degree Alignment Ticks */}
      <path
        d="M30 30 L70 70 M70 30 L30 70"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
