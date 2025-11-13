import { useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  Calendar as CalendarIcon,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function HotSellingProducts() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date('2025-10-19'),
    to: new Date('2025-10-26'),
  })
  const [selectedStore, setSelectedStore] = useState<string>('')

  const handleSearch = () => {
    // Handle search logic here
    console.log('Search:', { dateRange, selectedStore })
  }

  const handleReset = () => {
    setDateRange({
      from: new Date('2025-10-19'),
      to: new Date('2025-10-26'),
    })
    setSelectedStore('')
  }

  return (
    <div className='mt-8'>
      <CardContent className='space-y-4'>
        {/* Filter Panel */}
        <div className='flex flex-wrap items-center gap-4'>
          {/* Date Range */}
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium whitespace-nowrap'>
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-[280px] justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'yyyy-MM-dd')} -{' '}
                        {format(dateRange.to, 'yyyy-MM-dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'yyyy-MM-dd')
                    )
                  ) : (
                    <span>Pick a date range</span>
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

          {/* Store Selector */}
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium whitespace-nowrap'>
              Store
            </label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select Store Name' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='store1'>Store 1</SelectItem>
                <SelectItem value='store2'>Store 2</SelectItem>
                <SelectItem value='store3'>Store 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className='ml-auto flex items-center gap-2'>
            <Button onClick={handleSearch} variant='outline'>
              <Search className='mr-2 h-4 w-4' />
              Search
            </Button>
            <Button variant='outline' onClick={handleReset}>
              <RotateCcw className='mr-2 h-4 w-4' />
              Reset
            </Button>
          </div>
          <div>Hot Selling Products</div>
        </div>

        {/* Table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ranking</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>
                  <div className='flex items-center gap-2'>
                    Selling Amount
                    <ArrowUpDown className='text-muted-foreground h-4 w-4' />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className='h-[400px]'>
                  <div className='flex h-full flex-col items-center justify-center'>
                    <Sparkles className='text-muted-foreground mb-4 h-12 w-12' />
                    <p className='text-muted-foreground text-sm'>No Data</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </div>
  )
}
