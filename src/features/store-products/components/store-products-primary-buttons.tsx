import { Button } from '@/components/ui/button'
import { useStoreProducts } from './store-products-provider'

export function StoreProductsPrimaryButtons() {
  const { setOpen } = useStoreProducts()

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import Store Product</span>
      </Button>
    </div>
  )
}
