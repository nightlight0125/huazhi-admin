import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Plus, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  filters?: {
    columnId: string
    title: string
    options?: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function SourcingToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [productName, setProductName] = useState('')
  const [status, setStatus] = useState<string>('')

  const handleSearch = () => {
    table.setGlobalFilter(productName)
    if (status) {
      table.getColumn('status')?.setFilterValue([status])
    } else {
      table.getColumn('status')?.setFilterValue([])
    }
  }

  const handleReset = () => {
    setProductName('')
    setStatus('')
    table.resetColumnFilters()
    table.setGlobalFilter('')
  }

  return (
    <div className='w-full space-y-3'>
      {/* Search and Filter Row */}
      <div className='flex w-full items-center gap-3'>
        <div className='flex w-[40%] items-center gap-2'>
          <Label
            htmlFor='product-name'
            className='shrink-0 text-xs whitespace-nowrap'
          >
            Product Name
          </Label>
          <Input
            id='product-name'
            placeholder='Please enter'
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className='h-8 flex-1 text-xs'
          />
        </div>
        <div className='flex w-[40%] items-center gap-2'>
          <Label
            htmlFor='status'
            className='shrink-0 text-xs whitespace-nowrap'
          >
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id='status' className='h-8 flex-1 text-xs'>
              <SelectValue placeholder='Please select' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='processing'>Processing</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='failed'>Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
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
        </Button>
      </div>

      {/* New Sourcing Button */}
      <div>
        <Button
          className='h-8 bg-purple-600 text-xs hover:bg-purple-700'
          size='sm'
          onClick={() => {
            // Handle new sourcing action
            console.log('New Sourcing')
          }}
        >
          <Plus className='mr-1 h-3.5 w-3.5' />
          New Sourcing
        </Button>
      </div>
    </div>
  )
}
