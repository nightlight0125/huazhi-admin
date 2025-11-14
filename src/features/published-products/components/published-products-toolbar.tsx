import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PublishedProductsToolbarProps<TData> = {
  table: Table<TData>
}

export function PublishedProductsToolbar<TData>({
  table,
}: PublishedProductsToolbarProps<TData>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('')

  const handleSearch = () => {
    table.setGlobalFilter(searchTerm)
    // Apply store filter if needed
    if (selectedStore) {
      table.getColumn('storeName')?.setFilterValue(selectedStore)
    } else {
      table.getColumn('storeName')?.setFilterValue(undefined)
    }
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedStore('')
    table.resetColumnFilters()
    table.setGlobalFilter('')
  }

  return (
    <div className='flex items-center gap-3 border-b p-4'>
      <Input
        type='text'
        placeholder='Enter SPU/SKU/Product Name'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='h-9 flex-1'
      />

      <Select value={selectedStore} onValueChange={setSelectedStore}>
        <SelectTrigger className='h-9 w-[200px]'>
          <SelectValue placeholder='Select Store Name' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='zeloship'>zeloship - Shopify</SelectItem>
          <SelectItem value='store1'>store1 - Shopify</SelectItem>
          <SelectItem value='store2'>store2 - WooCommerce</SelectItem>
          <SelectItem value='store3'>store3 - Amazon</SelectItem>
        </SelectContent>
      </Select>

      {/* <Button onClick={handleSearch} className='h-9 text-white'>
        <Search className='mr-2 h-4 w-4' />
        Search
      </Button>

      <Button variant='outline' className='h-9' onClick={handleReset}>
        <RotateCcw className='mr-2 h-4 w-4' />
        Reset
      </Button> */}
    </div>
  )
}
