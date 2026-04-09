import type { ComponentPropsWithoutRef } from 'react'
import iconPaypalPng from './icon-paypal.png'

type IconPaypalProps = Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'alt'
> & {
  alt?: string
}

/** PayPal logo（Vite 会将 PNG 打包为带 hash 的 URL，dev / build 均可用）。 */
export function IconPaypal({
  className,
  alt = 'PayPal',
  ...props
}: IconPaypalProps) {
  return (
    <img src={iconPaypalPng} alt={alt} className={className} {...props} />
  )
}
