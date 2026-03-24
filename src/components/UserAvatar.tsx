import { User } from 'lucide-react';

interface UserAvatarProps {
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ email, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    const name = email.split('@')[0];
    const parts = name.split('.');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email?: string) => {
    if (!email) return 'bg-slate-500';
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500',
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${getAvatarColor(email)} 
      rounded-full 
      flex 
      items-center 
      justify-center 
      text-white 
      font-medium 
      ${className}
    `}>
      {email ? (
        <span className="select-none">{getInitials(email)}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  );
}
