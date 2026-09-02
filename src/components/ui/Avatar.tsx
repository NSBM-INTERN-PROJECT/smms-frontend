import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  initials?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  initials = '?',
  size = 40,
  className
}) => {
  return (
    <div 
      className={cn('avatar', className)} 
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt="Avatar" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
