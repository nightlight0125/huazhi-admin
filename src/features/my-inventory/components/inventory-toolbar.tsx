import { useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
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
    // Combine SPU and SKU for global filter
    const searchValue = spu || sku
    table.setGlobalFilter(searchValue)
    // Note: warehouse filter would need custom column filter implementation
  }

  const handleReset = () => {
    setSpu('')
    setSku('')
    setWarehouse('')
    table.resetColumnFilters()
    table.setGlobalFilter('')
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
        <Button
          onClick={handleSearch}
          className='h-8 shrink-0 bg-orange-500 text-xs text-white hover:bg-orange-600'
          size='sm'
        >
          <Search className='mr-1 h-3.5 w-3.5' />
          Search
        </Button>
        <Button
          variant='outline'
          onClick={handleReset}
          className='h-8 shrink-0 border-orange-300 bg-orange-100 text-xs text-orange-700 hover:bg-orange-200'
          size='sm'
        >
          <RotateCcw className='mr-1 h-3.5 w-3.5' />
          Reset
        </Button>
      </div>
    </div>
  )
}

