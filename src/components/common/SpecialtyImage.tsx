import React, { useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { getSpecialtyVisual } from '../../utils/medicalImages';

interface SpecialtyImageProps {
  imageUrl?: string;
  specialtyName?: string;
  className?: string;
  imgClassName?: string;
  variant?: 'thumbnail' | 'cover' | 'icon';
}

export const SpecialtyImage: React.FC<SpecialtyImageProps> = ({
  imageUrl,
  specialtyName,
  className = '',
  imgClassName = '',
  variant = 'thumbnail'
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const visual = getSpecialtyVisual(specialtyName);
  const resolvedImageUrl = imageUrl || visual.imageUrl;

  if (variant === 'icon') {
    return (
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xs overflow-hidden bg-gradient-to-br ${visual.gradient} text-white ${className}`}
      >
        <FiActivity className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center ${className}`}
    >
      {!error ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
              <FiActivity className="text-slate-300 w-8 h-8" />
            </div>
          )}
          <img
            src={resolvedImageUrl}
            alt={specialtyName || 'Chuyên khoa'}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${imgClassName}`}
          />
          {/* Subtle bottom shadow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />
        </>
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${visual.gradient} text-white`}
        >
          <FiActivity className="w-8 h-8" />
        </div>
      )}
    </div>
  );
};

export default SpecialtyImage;
