import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, RotateCcw, Search } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
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

type SupportTicketsToolbarProps = {
  onSearch?: (filters: {
    supportTicketNo?: string
    hzOrderNo?: string
    storeName?: string
    type?: string
    createTimeFrom?: Date
    createTimeTo?: Date
  }) => void
  onReset?: () => void
}

export function SupportTicketsToolbar({
  onSearch,
  onReset,
}: SupportTicketsToolbarProps) {
  const [supportTicketNo, setSupportTicketNo] = useState('')
  const [hzOrderNo, setHzOrderNo] = useState('')
  const [storeName, setStoreName] = useState('')
  const [type, setType] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const handleSearch = () => {
    onSearch?.({
      supportTicketNo: supportTicketNo || undefined,
      hzOrderNo: hzOrderNo || undefined,
      storeName: storeName || undefined,
      type: type || undefined,
      createTimeFrom: dateRange?.from,
      createTimeTo: dateRange?.to,
    })
  }

  const handleReset = () => {
    setSupportTicketNo('')
    setHzOrderNo('')
    setStoreName('')
    setType('')
    setDateRange(undefined)
    onReset?.()
  }

  return (
    <div className='dark:bg-card space-y-3 rounded-lg border bg-white p-4'>
      {/* First Row: Support Tickets NO. and HZ Order NO. */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Support Tickets NO. */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Support Tickets NO.
          </label>
          <Input
            placeholder='Enter support ticket number'
            value={supportTicketNo}
            onChange={(e) => setSupportTicketNo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9 min-w-[180px]'
          />
        </div>

        {/* HZ Order NO. */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            HZ Order NO.
          </label>
          <Input
            placeholder='Enter HZ order number'
            value={hzOrderNo}
            onChange={(e) => setHzOrderNo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='h-9 min-w-[180px]'
          />
        </div>
      </div>

      {/* Second Row: Store Name, Type, Create Time, and Buttons */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Store Name */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Store Name
          </label>
          <Select value={storeName} onValueChange={setStoreName}>
            <SelectTrigger className='h-9 min-w-[140px]'>
              <SelectValue placeholder='Select store' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='store1'>Store 1</SelectItem>
              <SelectItem value='store2'>Store 2</SelectItem>
              <SelectItem value='store3'>Store 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className='h-9 min-w-[140px]'>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Product return'>Product return</SelectItem>
              <SelectItem value='Other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Time Date Range */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Create Time
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-9 min-w-[280px] justify-start text-left font-normal',
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
                  <span>开始日期 - 结束日期</span>
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
