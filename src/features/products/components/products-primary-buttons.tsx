import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from './products-provider'

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>导入</span> <Download size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>新增产品</span> <Plus size={18} />
      </Button>
    </div>
  )
}
