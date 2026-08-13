import Image from 'next/image';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
}

/**
 * Logo for Le Major — transparent PNG, adapts to any background via CSS filter.
 * variant="light" → white logo (for dark backgrounds like navbars)
 * variant="dark"  → original dark logo (for light/colored backgrounds)
 * showText=false  → emblem only (for collapsed sidebar icon)
 */
export default function Logo({ variant = 'light', className = '', showText = false }: LogoProps) {
  const src = showText === false ? '/icon.png' : '/logo.png';
  const filter = variant === 'light' ? 'brightness(0) invert(1)' : 'none';

  return (
    <Image
      src={src}
      alt="Le Major"
      width={showText ? 220 : 56}
      height={showText ? 60 : 56}
      className={className}
      style={{ filter }}
      priority
    />
  );
}
