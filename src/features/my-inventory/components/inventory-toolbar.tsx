import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'

type InventoryToolbarProps<TData> = {
  table: Table<TData>
}

export function InventoryToolbar<TData>({
  table,
}: InventoryToolbarProps<TData>) {
  const [spu, setSpu] = useState('')
  const [sku, setSku] = useState('')
  const [warehouse, setWarehouse] = useState('')

  const handleSearch = () => {
    const searchValue = spu || sku
    table.setGlobalFilter(searchValue)
  }

  return (
    <div className='w-full space-y-3'>
      {/* Search and Filter Row */}
      <div className='flex w-full items-center gap-3'>
        <div className='flex w-[30%] items-center gap-2'>
          <Input
            id='spu'
            placeholder='Please enter SPU'
            value={spu}
            onChange={(e) => setSpu(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-8 flex-1 text-xs'
          />
        </div>
        <div className='flex w-[30%] items-center gap-2'>
          <Input
            id='sku'
            placeholder='Please enter SKU'
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-8 flex-1 text-xs'
          />
        </div>
        <div className='flex w-[30%] items-center gap-2'>
          <Input
            id='warehouse'
            placeholder='Please enter Warehouse'
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-8 flex-1 text-xs'
          />
        </div>
      </div>
    </div>
  )
}
