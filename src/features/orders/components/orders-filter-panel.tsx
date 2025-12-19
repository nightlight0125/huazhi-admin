import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, RotateCcw, Search } from 'lucide-react'
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

type SearchType =
  | 'storeOrderNum'
  | 'hzOrderNum'
  | 'productName'
  | 'customerNarr'
  | 'hzSkuId'

const searchTypes: { value: SearchType; label: string }[] = [
  { value: 'storeOrderNum', label: 'Store Order Num' },
  { value: 'hzOrderNum', label: 'Order Num' },
  { value: 'productName', label: 'Product Name' },
  { value: 'customerNarr', label: 'Customer Narr' },
  { value: 'hzSkuId', label: 'SKU ID' },
]

export function OrdersFilterPanel() {
  // Search state
  const [searchType, setSearchType] = useState<SearchType>('storeOrderNum')
  const [searchValue, setSearchValue] = useState('')

  // Filter states
  const [country, setCountry] = useState('')
  const [shop, setShop] = useState('')
  const [logistics, setLogistics] = useState('')
  const [platformOrderStatus, setPlatformOrderStatus] = useState('')
  const [hzOrderStatus, setHzOrderStatus] = useState('')
  const [location, setLocation] = useState('')
  const [invoiceStatus, setInvoiceStatus] = useState('')
  const [startTime, setStartTime] = useState<Date | undefined>(undefined)
  const [endTime, setEndTime] = useState<Date | undefined>(undefined)

  const handleSearch = () => {
    // TODO: Implement search logic
    console.log('Search with filters:', {
      searchType,
      searchValue,
      country,
      shop,
      logistics,
      platformOrderStatus,
      hzOrderStatus,
      location,
      invoiceStatus,
      startTime,
      endTime,
    })
  }

  const handleReset = () => {
    setSearchType('storeOrderNum')
    setSearchValue('')
    setCountry('')
    setShop('')
    setLogistics('')
    setPlatformOrderStatus('')
    setHzOrderStatus('')
    setLocation('')
    setInvoiceStatus('')
    setStartTime(undefined)
    setEndTime(undefined)
  }

  const selectedSearchType = searchTypes.find(
    (type) => type.value === searchType
  )

  return (
    <div className='dark:bg-card space-y-3 rounded-lg border bg-white p-4'>
      {/* First Row */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Combined Search Box */}
        <div className='flex min-w-[300px] flex-1 items-center gap-0 overflow-hidden rounded-md border'>
          <Select
            value={searchType}
            onValueChange={(value) => setSearchType(value as SearchType)}
          >
            <SelectTrigger className='h-9 w-[180px] rounded-none border-0 border-r focus:ring-0 focus:ring-offset-0'>
              <SelectValue>
                {selectedSearchType?.label || 'Select type'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {searchTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='relative flex-1'>
            <Input
              placeholder={`Enter ${selectedSearchType?.label.toLowerCase() || 'search term'}...`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className='h-9 rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
            />
            <Search className='text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
          </div>
        </div>

        {/* Country */}
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className='h-9 min-w-[140px]'>
            <SelectValue placeholder='-Select Country-' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='us'>United States</SelectItem>
            <SelectItem value='uk'>United Kingdom</SelectItem>
            <SelectItem value='ca'>Canada</SelectItem>
            <SelectItem value='au'>Australia</SelectItem>
            <SelectItem value='de'>Germany</SelectItem>
            <SelectItem value='fr'>France</SelectItem>
          </SelectContent>
        </Select>

        {/* Shop */}
        <Select value={shop} onValueChange={setShop}>
          <SelectTrigger className='h-9 min-w-[140px]'>
            <SelectValue placeholder='-Select Shop-' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='shop1'>Shop 1</SelectItem>
            <SelectItem value='shop2'>Shop 2</SelectItem>
            <SelectItem value='shop3'>Shop 3</SelectItem>
          </SelectContent>
        </Select>

        {/* Logistics */}
        <Select value={logistics} onValueChange={setLogistics}>
          <SelectTrigger className='h-9 min-w-[140px]'>
            <SelectValue placeholder='-Logistics-' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='dhl'>DHL</SelectItem>
            <SelectItem value='fedex'>FedEx</SelectItem>
            <SelectItem value='ups'>UPS</SelectItem>
            <SelectItem value='usps'>USPS</SelectItem>
          </SelectContent>
        </Select>
        {/* Platform Order Status */}
        <Select
          value={platformOrderStatus}
          onValueChange={setPlatformOrderStatus}
        >
          <SelectTrigger className='h-9 min-w-[160px]'>
            <SelectValue placeholder='Platform Order Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='shipped'>Shipped</SelectItem>
            <SelectItem value='delivered'>Delivered</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Select value={hzOrderStatus} onValueChange={setHzOrderStatus}>
          <SelectTrigger className='h-9 min-w-[140px]'>
            <SelectValue placeholder='Order Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='confirmed'>Confirmed</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Location */}
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className='h-9 min-w-[140px]'>
            <SelectValue placeholder='-Select Location-' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='us'>United States</SelectItem>
            <SelectItem value='cn'>China</SelectItem>
            <SelectItem value='uk'>United Kingdom</SelectItem>
            <SelectItem value='de'>Germany</SelectItem>
          </SelectContent>
        </Select>

        {/* Invoice Status */}
        <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
          <SelectTrigger className='h-9 min-w-[140px]'>
            <SelectValue placeholder='-Invoice Status-' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='issued'>Issued</SelectItem>
            <SelectItem value='paid'>Paid</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Start Time */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'h-9 min-w-[140px] justify-start text-left font-normal',
                !startTime && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {startTime ? format(startTime, 'yyyy-MM-dd') : 'Start Time'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={startTime}
              onSelect={setStartTime}
            />
          </PopoverContent>
        </Popover>

        {/* Separator */}
        <div className='text-muted-foreground flex items-center justify-center px-1'>
          -
        </div>

        {/* End Time */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'h-9 min-w-[140px] justify-start text-left font-normal',
                !endTime && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {endTime ? format(endTime, 'yyyy-MM-dd') : 'End Time'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={endTime}
              onSelect={setEndTime}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
