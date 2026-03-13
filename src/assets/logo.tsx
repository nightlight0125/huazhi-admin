import { type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const logoSrc = new URL('./HyperZoneLOGO.svg', import.meta.url).toString()

export function Logo({
  className,
  alt = 'Logo',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={logoSrc} alt={alt} className={cn(className)} {...props} />
}
