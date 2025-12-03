import { type Row } from '@tanstack/react-table'
import {
  CreditCard,
  Edit3,
  Package,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Order } from '../data/schema'

interface OrdersRowActionsProps {
  row: Row<Order>
  onModifyProduct?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
}

export function OrdersRowActions({
  row,
  onModifyProduct,
  onEditAddress,
}: OrdersRowActionsProps) {
  const order = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label='Open menu'
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className='h-4 w-4' aria-hidden='true' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-[160px]'
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={() => {
            // 原来 Pay 按钮没有事件，这里仅保留占位
            console.log('Pay order:', order.id)
          }}
        >
          <CreditCard className='mr-2 h-4 w-4' />
          Pay
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onModifyProduct?.(order.id)
          }}
        >
          <Edit3 className='mr-2 h-4 w-4' />
          Modify Product
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onEditAddress?.(order.id)
          }}
        >
          <Edit3 className='mr-2 h-4 w-4' />
          Edit Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // 原来 Add Package 按钮没有事件，这里仅保留占位
            console.log('Add Package for order:', order.id)
          }}
        >
          <Package className='mr-2 h-4 w-4' />
          Add Package
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


