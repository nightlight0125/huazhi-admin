import { useState } from 'react'
import { format } from 'date-fns'
import { type Table } from '@tanstack/react-table'
import { Calendar as CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
}

export function LikedProductsToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [productName, setProductName] = useState('')
  const [tdSpu, setTdSpu] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const handleSearch = () => {
    table.setGlobalFilter(productName || tdSpu)
    // Apply date range filter if needed
    // This would need to be implemented based on your filtering logic
  }

  const handleReset = () => {
    setProductName('')
    setTdSpu('')
    setDateRange({ from: undefined, to: undefined })
    table.resetColumnFilters()
    table.setGlobalFilter('')
  }

  return (
    <div className='w-full space-y-3'>
      {/* Search and Filter Row */}
      <div className='flex w-full items-center gap-3'>
        <div className='flex w-[30%] items-center gap-2'>
          {/* <Label
            htmlFor='product-name'
            className='shrink-0 text-xs whitespace-nowrap'
          >
            Product Name
          </Label> */}
          <Input
            id='product-name'
            placeholder='Please enter Product Name'
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className='h-8 flex-1 text-xs'
          />
        </div>
        <div className='flex w-[30%] items-center gap-2'>
          {/* <Label
            htmlFor='td-spu'
            className='shrink-0 text-xs whitespace-nowrap'
          >
            TD SPU
          </Label> */}
          <Input
            id='td-spu'
            placeholder='Please enter TD SPU'
            value={tdSpu}
            onChange={(e) => setTdSpu(e.target.value)}
            className='h-8 flex-1 text-xs'
          />
        </div>
        <div className='flex w-[30%] items-center gap-2'>
          {/* <Label className='shrink-0 text-xs whitespace-nowrap'>Add Date</Label> */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-8 flex-1 justify-start text-left text-xs font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-3.5 w-3.5' />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM d, yyyy')} -{' '}
                      {format(dateRange.to, 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM d, yyyy')
                  )
                ) : (
                  <span>Add Date - Start Date - End Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* <Button
          onClick={handleSearch}
          variant='outline'
          className='h-8 shrink-0 text-xs hover:bg-purple-700'
          size='sm'
        >
          <Search className='mr-1 h-3.5 w-3.5' />
          Search
        </Button>
        <Button
          variant='outline'
          onClick={handleReset}
          className='h-8 shrink-0 text-xs'
          size='sm'
        >
          <RotateCcw className='mr-1 h-3.5 w-3.5' />
          Reset
        </Button> */}
      </div>
    </div>
  )
}
