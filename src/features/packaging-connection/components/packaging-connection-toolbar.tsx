import { useState } from 'react'
import { Lock, LockOpen, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { storeNameOptions } from '../data/data'

type PackagingConnectionToolbarProps = {
  onSearch: (filters: {
    storeName1?: string
    storeName2?: string
    storeSku?: string
    productName?: string
    status?: 'connected' | 'unconnected' | 'all'
  }) => void
  onReset: () => void
  statusFilter?: 'connected' | 'unconnected' | 'all'
  onStatusFilterChange?: (status: 'connected' | 'unconnected' | 'all') => void
}

export function PackagingConnectionToolbar({
  onSearch,
  onReset,
  statusFilter = 'all',
  onStatusFilterChange,
}: PackagingConnectionToolbarProps) {
  const [storeName1, setStoreName1] = useState('')
  const [storeName2, setStoreName2] = useState('')
  const [storeSku, setStoreSku] = useState('')
  const [productName, setProductName] = useState('')

  const handleSearch = () => {
    onSearch({
      storeName1: storeName1 || undefined,
      storeName2: storeName2 || undefined,
      storeSku: storeSku || undefined,
      productName: productName || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    })
  }

  const handleReset = () => {
    setStoreName1('')
    setStoreName2('')
    setStoreSku('')
    setProductName('')
    onReset()
  }

  return (
    <div className='space-y-4'>
      {/* Status Filters */}
      <div className='flex items-center gap-4'>
        <Button
          variant={statusFilter === 'connected' ? 'default' : 'outline'}
          size='sm'
          onClick={() => onStatusFilterChange?.('connected')}
          className='gap-2'
        >
          <Lock className='h-4 w-4' />
          Connected
        </Button>
        <Button
          variant={statusFilter === 'unconnected' ? 'default' : 'outline'}
          size='sm'
          onClick={() => onStatusFilterChange?.('unconnected')}
          className='gap-2'
        >
          <LockOpen className='h-4 w-4' />
          Unconnected
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className='bg-card flex flex-wrap items-center gap-3 rounded-md border p-4'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Store Name
          </label>
          <Select value={storeName1} onValueChange={setStoreName1}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Store Name' />
            </SelectTrigger>
            <SelectContent>
              {storeNameOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Store SKU/Product Name
          </label>
          <Input
            placeholder='Enter Store SKU/Product Name'
            value={storeSku}
            onChange={(e) => setStoreSku(e.target.value)}
            className='w-[250px]'
          />
        </div>

        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Enter Store SKU/Product Name
          </label>
          <Input
            placeholder='Enter Store SKU/Product Name'
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className='w-[250px]'
          />
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <Button
            onClick={handleSearch}
            className='bg-purple-600 text-white hover:bg-purple-700'
          >
            <Search className='mr-2 h-4 w-4' />
            Search
          </Button>
          <Button variant='outline' onClick={handleReset}>
            <RotateCcw className='mr-2 h-4 w-4' />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
