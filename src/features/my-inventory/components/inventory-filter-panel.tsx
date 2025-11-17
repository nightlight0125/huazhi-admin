import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const route = getRouteApi('/_authenticated/my-inventory/')

type InventoryFilterPanelProps = {
  onSearch: (filters: { spu: string; sku: string; warehouse: string }) => void
  onReset: () => void
}

export function InventoryFilterPanel({
  onSearch,
  onReset,
}: InventoryFilterPanelProps) {
  const search = route.useSearch()
  const [spu, setSpu] = useState(search.spu || '')
  const [sku, setSku] = useState(search.sku || '')
  const [warehouse, setWarehouse] = useState(search.warehouse || '')

  // 同步URL中的筛选条件到本地状态
  useEffect(() => {
    setSpu(search.spu || '')
    setSku(search.sku || '')
    setWarehouse(search.warehouse || '')
  }, [search])

  const handleSearch = () => {
    onSearch({ spu, sku, warehouse })
  }

  const handleReset = () => {
    setSpu('')
    setSku('')
    setWarehouse('')
    onReset()
  }

  return (
    <div className='dark:bg-card space-y-4 rounded-lg border bg-white p-4'>
      <div className='flex flex-wrap items-end gap-4'>
        <div className='min-w-[200px] flex-1 space-y-2'>
          <Label htmlFor='spu'>SPU</Label>
          <Input
            id='spu'
            placeholder='Enter SPU'
            value={spu}
            onChange={(e) => setSpu(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </div>

        <div className='min-w-[200px] flex-1 space-y-2'>
          <Label htmlFor='sku'>SKU</Label>
          <Input
            id='sku'
            placeholder='Enter SKU'
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </div>

        <div className='min-w-[200px] flex-1 space-y-2'>
          <Label htmlFor='warehouse'>Warehouse</Label>
          <Input
            id='warehouse'
            placeholder='Enter Warehouse'
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </div>

        <div className='flex items-center gap-2'>
          <Button
            onClick={handleSearch}
            className='h-9 bg-orange-500 whitespace-nowrap text-white hover:bg-orange-600'
          >
            <Search className='mr-2 h-4 w-4' />
            Search
          </Button>
          <Button
            onClick={handleReset}
            variant='outline'
            className='h-9 border-orange-300 bg-orange-100 whitespace-nowrap text-orange-700 hover:bg-orange-200'
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
