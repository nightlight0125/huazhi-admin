import { useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type LogisticsToolbarProps = {
  onSearch?: (filters: {
    sku?: string
    shippingFrom?: string
    shippingTo?: string
    shippingMethod?: string
  }) => void
  onReset?: () => void
}

export function LogisticsToolbar({
  onSearch,
  onReset,
}: LogisticsToolbarProps) {
  const [sku, setSku] = useState('')
  const [shippingFrom, setShippingFrom] = useState('')
  const [shippingTo, setShippingTo] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')

  const handleSearch = () => {
    onSearch?.({
      sku: sku || undefined,
      shippingFrom: shippingFrom || undefined,
      shippingTo: shippingTo || undefined,
      shippingMethod: shippingMethod || undefined,
    })
  }

  const handleReset = () => {
    setSku('')
    setShippingFrom('')
    setShippingTo('')
    setShippingMethod('')
    onReset?.()
  }

  return (
    <div className='dark:bg-card space-y-3 rounded-lg border bg-white p-4'>
      <div className='flex flex-wrap items-center gap-3'>
        {/* SKU */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>SKU</label>
          <Input
            placeholder='Enter SKU'
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9 min-w-[180px]'
          />
        </div>

        {/* Shipping From */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Shipping From
          </label>
          <Input
            placeholder='Enter shipping from'
            value={shippingFrom}
            onChange={(e) => setShippingFrom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9 min-w-[180px]'
          />
        </div>

        {/* TO */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>TO</label>
          <Input
            placeholder='Enter shipping to'
            value={shippingTo}
            onChange={(e) => setShippingTo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9 min-w-[180px]'
          />
        </div>

        {/* Shipping Method */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Shipping Method
          </label>
          <Input
            placeholder='Enter shipping method'
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9 min-w-[180px]'
          />
        </div>

        {/* Search and Reset Buttons */}
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

