import { type Row } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type PublishedProduct } from '../data/schema'

type PublishedProductsRowActionsProps = {
  row: Row<PublishedProduct>
}

export function PublishedProductsRowActions({
  row,
}: PublishedProductsRowActionsProps) {
  const product = row.original

  return (
    <Button
      variant='outline'
      size='sm'
      className='h-7 border-red-200 px-2 text-xs text-red-500'
      onClick={(e) => {
        e.stopPropagation()
        console.log('Delete published product:', product.id)
        // TODO: 在这里调用删除已发布商品的接口
      }}
    >
      <Trash2 className='mr-1 h-3.5 w-3.5' />
    </Button>
  )
}
