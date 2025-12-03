import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StoreProductsPrimaryButtons } from './store-products-primary-buttons'
import { useStoreProducts } from './store-products-provider'

export function StoreProductsToolbar() {
  const { setOpen: _setOpen } = useStoreProducts()
  const [selectedShop, setSelectedShop] = useState<string>('')
  const [associateStatus, setAssociateStatus] = useState<string>('')

  return (
    <div className='flex items-center gap-3'>
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
