import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { getDoctorAvatar } from '../../utils/medicalImages';

interface DoctorAvatarProps {
  imageUrl?: string;
  email?: string;
  fullName?: string;
  doctorId?: number;
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24 sm:w-28 sm:h-28',
  xl: 'w-32 h-32 sm:w-40 sm:h-40'
};

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  imageUrl,
  email,
  fullName,
  doctorId,
  className = '',
  imgClassName = '',
  size = 'md'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const avatarUrl = imageUrl || getDoctorAvatar(email, fullName, doctorId);

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-emerald-50/80 flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${sizeClasses[size]} ${className}`}
    >
      {!imageError ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
              <FiUser className="text-slate-300 w-1/2 h-1/2" />
            </div>
          )}
          <img
            src={avatarUrl}
            alt={fullName || 'Bác sĩ YouMed'}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${imgClassName}`}
          />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-sm sm:text-base">
          {fullName ? fullName.split(' ').slice(-1)[0].charAt(0).toUpperCase() : <FiUser className="w-1/2 h-1/2" />}
        </div>
      )}
    </div>
  );
};

export default DoctorAvatar;
