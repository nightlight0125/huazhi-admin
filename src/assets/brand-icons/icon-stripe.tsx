import type { ComponentPropsWithoutRef } from 'react'
import iconStripePng from './icon-stripe.png'

type IconStripeProps = Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'alt'
> & {
  alt?: string
}

/** Stripe logo（Vite 会将 PNG 打包为带 hash 的 URL，dev / build 均可用）。 */
export function IconStripe({
  className,
  alt = 'Stripe',
  ...props
}: IconStripeProps) {
  return (
    <img src={iconStripePng} alt={alt} className={className} {...props} />
  )
}
