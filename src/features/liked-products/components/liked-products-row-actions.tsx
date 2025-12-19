import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { Store, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { delRecommendProducts } from '@/lib/api/products'
import { type LikedProduct } from '../data/schema'

type LikedProductsRowActionsProps = {
  row: Row<LikedProduct>
}

export function LikedProductsRowActions({ row }: LikedProductsRowActionsProps) {
  const product = row.original
  const { auth } = useAuthStore()
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        size='sm'
        className='h-7 px-2 text-xs'
        onClick={(e) => {
          e.stopPropagation()
          console.log('Publish liked product to store:', product.id)
        }}
      >
        <Store className='mr-1 h-3.5 w-3.5' />
        Publish
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='h-7 border-red-200 px-2 text-xs text-red-500'
        disabled={isDeleting}
        onClick={async (e) => {
          e.stopPropagation()

          const customerId = auth.user?.id
          if (!customerId) {
            toast.error('User not authenticated. Please login again.')
            return
          }

          try {
            setIsDeleting(true)
            await delRecommendProducts({
              customerId,
              productIds: [product.id],
            })

            toast.success('Product removed from collection successfully.')
          } catch (error) {
            console.error('删除收藏商品失败:', error)
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to delete collection product. Please try again.'
            )
          } finally {
            setIsDeleting(false)
          }
        }}
      >
        <Trash2 className='mr-1 h-3.5 w-3.5' />
      </Button>
    </div>
  )
}
