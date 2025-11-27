import { useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function StockOrdersFilterPanel() {
  // Search state
  const [orderNumber, setOrderNumber] = useState('')
  const [sku, setSku] = useState('')
  const [productName, setProductName] = useState('')
  const [logisticsValue, setLogisticsValue] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const handleSearch = () => {
    // TODO: Implement search logic
    console.log('Search with filters:', {
      orderNumber,
      sku,
      productName,
      logisticsValue,
      startTime: dateRange?.from,
      endTime: dateRange?.to,
    })
  }

  const handleReset = () => {
    setOrderNumber('')
    setSku('')
    setProductName('')
    setLogisticsValue('')
    setDateRange(undefined)
  }

  return (
    <div className='dark:bg-card space-y-3 rounded-lg border bg-white p-4'>
      <div className='flex flex-wrap items-center gap-3'>
        {/* Order Number */}
        <div className='relative min-w-[200px] flex-1'>
          <Input
            placeholder='Order Number'
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9'
          />
          <Search className='text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
        </div>

        {/* SKU */}
        <div className='relative min-w-[200px] flex-1'>
          <Input
            placeholder='SKU'
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9'
          />
          <Search className='text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
        </div>

        {/* Product Name */}
        <div className='relative min-w-[200px] flex-1'>
          <Input
            placeholder='Product Name'
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9'
          />
          <Search className='text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
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
