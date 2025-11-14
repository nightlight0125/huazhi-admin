import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StoreProductsPrimaryButtons } from './store-products-primary-buttons'
import { useStoreProducts } from './store-products-provider'

type StoreProductsToolbarProps<TData> = {
  table: Table<TData>
}

export function StoreProductsToolbar<TData>({
  table,
}: StoreProductsToolbarProps<TData>) {
  const { setOpen } = useStoreProducts()
  const [productName, setProductName] = useState('')
  const [selectedShop, setSelectedShop] = useState<string>('')
  const [associateStatus, setAssociateStatus] = useState<string>('')

  const handleSearch = () => {
    table.setGlobalFilter(productName)
    // Apply shop and status filters if needed
    // You can add more filtering logic here
  }

  return (
    <div className='flex items-center gap-3 border-b p-4'>
      <div className='relative flex-1'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          type='text'
          placeholder='Product Name'
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className='h-9 pl-9'
        />
      </div>

      <Select value={selectedShop} onValueChange={setSelectedShop}>
        <SelectTrigger className='h-9 w-[180px]'>
          <SelectValue placeholder='- Select Shop -' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='shop1'>Shop 1</SelectItem>
          <SelectItem value='shop2'>Shop 2</SelectItem>
          <SelectItem value='shop3'>Shop 3</SelectItem>
        </SelectContent>
      </Select>

      <Select value={associateStatus} onValueChange={setAssociateStatus}>
        <SelectTrigger className='h-9 w-[180px]'>
          <SelectValue placeholder='- Associate Status -' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='associated'>Associated</SelectItem>
          <SelectItem value='not-associated'>Not Associated</SelectItem>
          <SelectItem value='pending'>Pending</SelectItem>
        </SelectContent>
      </Select>
      <StoreProductsPrimaryButtons />
    </div>
  )
}
