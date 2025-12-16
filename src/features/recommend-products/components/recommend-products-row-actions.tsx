import { type Row } from '@tanstack/react-table'
import { Store, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type RecommendProduct } from '../data/schema'

type RecommendProductsRowActionsProps = {
  row: Row<RecommendProduct>
}

export function RecommendProductsRowActions({
  row,
}: RecommendProductsRowActionsProps) {
  const product = row.original

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        size='sm'
        className='h-7 px-2 text-xs'
        onClick={(e) => {
          e.stopPropagation()
          console.log('Publish recommend product to store:', product.id)
        }}
      >
        <Store className='mr-1 h-3.5 w-3.5' />
        Publish
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='h-7 border-red-200 px-2 text-xs text-red-500'
        onClick={(e) => {
          e.stopPropagation()
          console.log('Delete recommend product:', product.id)
        }}
      >
        <Trash2 className='mr-1 h-3.5 w-3.5' />
        Delete
      </Button>
    </div>
  )
}
