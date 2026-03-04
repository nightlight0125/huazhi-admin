import { type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// 使用 SVG 版本的 Logo，放大/缩小时更清晰
const logoSrc = new URL('./logo.svg', import.meta.url).toString()

export function Logo({
  className,
  alt = 'Logo',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn('object-contain', className)}
      {...props}
    />
  )
}
