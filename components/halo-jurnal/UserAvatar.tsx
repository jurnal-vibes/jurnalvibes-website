import React from 'react'

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'U'
  const cleanName = name.trim()
  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface UserAvatarProps {
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  bgColor?: 'maroon' | 'gold' | 'primary'
  className?: string
}

export default function UserAvatar({
  name,
  size = 'md',
  bgColor = 'primary',
  className = '',
}: UserAvatarProps) {
  const initials = getInitials(name)

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] font-bold',
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-14 h-14 md:w-16 md:h-16 text-lg md:text-xl font-bold',
    xl: 'w-20 h-20 md:w-24 md:h-24 text-2xl md:text-3xl font-extrabold',
  }[size]

  const bgClasses = bgColor === 'gold' 
    ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-xs ring-2 ring-amber-500/20'
    : bgColor === 'maroon'
    ? 'bg-gradient-to-tr from-[#66000c] to-[#990011] text-white shadow-xs ring-2 ring-[#990011]/20'
    : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 text-white shadow-xs ring-2 ring-slate-200 dark:ring-slate-700'

  const roundedClass = (size === 'lg' || size === 'xl') ? 'rounded-2xl' : 'rounded-full'

  return (
    <div
      className={`${roundedClass} flex items-center justify-center font-bold font-heading shrink-0 select-none tracking-wider shadow-xs ${sizeClasses} ${bgClasses} ${className}`}
      title={name || 'User'}
    >
      <span className="leading-none">{initials}</span>
    </div>
  )
}
