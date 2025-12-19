import { type Row } from '@tanstack/react-table'
import { CreditCard, Edit3, MoreHorizontal, Package } from 'lucide-react'
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
  onPay?: (orderId: string) => void
}

export function OrdersRowActions({
  row,
  onModifyProduct,
  onEditAddress,
  onPay,
}: OrdersRowActionsProps) {
  const order = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label='Open menu'
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
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
            onPay?.(order.id)
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
