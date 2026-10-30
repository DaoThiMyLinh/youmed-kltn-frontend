import React from 'react';
import { Link } from 'react-router-dom';

export interface LogoProps {
  /** 'full': horizontal logo with text; 'icon': square app icon; 'large': hero brand mark */
  variant?: 'full' | 'icon' | 'large';
  /** Preset sizes */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 'light' uses the normal colored logo, 'dark' is for dark backgrounds (footer, etc.) */
  theme?: 'light' | 'dark';
  /** If provided, wraps the logo in a React Router Link */
  to?: string;
  className?: string;
  alt?: string;
  showTagline?: boolean;
}

const heightMap: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'h-8 max-h-8',
  md: 'h-10 max-h-10',
  lg: 'h-14 max-h-14',
  xl: 'h-20 max-h-20',
};

const iconSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
  xl: 'w-20 h-20 rounded-3xl',
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'light',
  to,
  className = '',
  alt = 'YouMed - Hệ thống Y tế Thông minh',
}) => {
  // Select appropriate image source based on variant & theme
  let src = '/images/youmed-logo-transparent.png';

  if (variant === 'icon') {
    src = '/images/youmed-icon.png';
  } else if (variant === 'large') {
    src = '/images/youmed-logo-large.png';
  } else if (theme === 'dark') {
    src = '/logo-white.svg';
  }

  const isIcon = variant === 'icon';
  const imgClass = isIcon
    ? `${iconSizeMap[size]} object-cover shadow-sm transition-transform duration-300 hover:scale-105`
    : `${heightMap[size]} w-auto object-contain transition-transform duration-300 hover:opacity-95`;

  const imageElement = (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={src}
        alt={alt}
        className={imgClass}
        loading="eager"
        onError={(e) => {
          // Fallback to svg if png fails
          const target = e.currentTarget;
          if (variant === 'icon') {
            target.src = '/logo-icon.svg';
          } else {
            target.src = theme === 'dark' ? '/logo-white.svg' : '/logo-full.svg';
          }
        }}
      />
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none inline-flex items-center">
        {imageElement}
      </Link>
    );
  }

  return imageElement;
};

export default Logo;
