interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
}

/**
 * SVG Logo for Le Major — fully transparent, adapts to any background.
 * variant="light" → white logo (for dark backgrounds like navbars)
 * variant="dark"  → navy logo (for light backgrounds like login page)
 * showText=false  → emblem only (for collapsed sidebar icon)
 */
export default function Logo({ variant = 'light', className = '', showText = true }: LogoProps) {
  const color = variant === 'light' ? '#FFFFFF' : '#0F1D35';
  const viewBox = showText ? '0 0 220 62' : '0 0 44 62';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      className={className}
      aria-label="Le Major"
      role="img"
    >
      {/* === Geometric emblem: open book + upward arrow === */}
      {/* Left page of book */}
      <polygon
        points="4,40 22,30 22,46 4,56"
        fill={color}
        opacity="0.9"
      />
      {/* Right page of book */}
      <polygon
        points="40,40 22,30 22,46 40,56"
        fill={color}
        opacity="0.7"
      />
      {/* Spine of book */}
      <line x1="22" y1="30" x2="22" y2="56" stroke={color} strokeWidth="1.5" />
      {/* Upward arrow stem */}
      <line
        x1="22" y1="8" x2="22" y2="30"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Upward arrow head */}
      <polyline
        points="12,22 22,8 32,22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* === Wordmark: "Le Major" === */}
      {showText && (
        <text
          x="52"
          y="42"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="28"
          fontWeight="600"
          fill={color}
          letterSpacing="-0.5"
        >
          Le Major
        </text>
      )}
    </svg>
  );
}
