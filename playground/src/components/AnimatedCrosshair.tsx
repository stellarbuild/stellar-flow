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
      {/* Static crosshair arms — short inner segments only */}
      <path
        d="M50 5 L50 32 M50 68 L50 95 M5 50 L32 50 M68 50 L95 50"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
      />

      {/* Rotating outer dashed orbit ring */}
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        opacity="0.55"
        style={{
          transformOrigin: '50px 50px',
          animation: 'orbitSpin 6s linear infinite',
        }}
      />

      {/* Counter-rotating inner dashed ring */}
      <circle
        cx="50"
        cy="50"
        r="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 6"
        opacity="0.35"
        style={{
          transformOrigin: '50px 50px',
          animation: 'orbitSpinReverse 4s linear infinite',
        }}
      />

      {/* Precision center dot — pulsing */}
      <circle
        cx="50"
        cy="50"
        r="4"
        fill="currentColor"
        style={{ animation: 'pulseDot 2.5s ease-in-out infinite' }}
      />

      {/* 4 corner alignment ticks at 45° */}
      <path
        d="M32 32 L38 38 M68 32 L62 38 M32 68 L38 62 M68 68 L62 62"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.4"
        strokeLinecap="square"
      />
    </svg>
  );
}
