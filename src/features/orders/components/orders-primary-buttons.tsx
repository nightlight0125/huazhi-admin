import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { type Table } from '@tanstack/react-table'
import {
  ChevronDown,
  Download,
  FileDown,
  Loader2,
  Merge,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Truck,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { addRMAOrder } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Order } from '../data/schema'
import { useOrders } from './orders-provider'

interface OrdersPrimaryButtonsProps {
  table?: Table<Order> | null
}

export function OrdersPrimaryButtons({ table }: OrdersPrimaryButtonsProps) {
  const { setOpen } = useOrders()
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [rmaDialogOpen, setRmaDialogOpen] = useState(false)
  const [isCreatingRMA, setIsCreatingRMA] = useState(false)

  const handleCreateRMA = async () => {
    if (!table) {
      toast.error('Table not available')
      return
    }

    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error('Please select at least one order')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Please select only one order')
      return
    }

    const customerId = auth.user?.customerId || auth.user?.id
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    const order = selectedRows[0].original
    setIsCreatingRMA(true)

    try {
      await addRMAOrder({
        customerId: String(customerId),
        orderId: order.id,
      })
      toast.success('RMA order created successfully')
      setRmaDialogOpen(false)
      // 刷新订单列表
      table.resetRowSelection()
    } catch (error) {
      console.error('创建售后订单失败:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create RMA order. Please try again.'
      )
    } finally {
      setIsCreatingRMA(false)
    }
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'cancel':
        // TODO: Implement cancel action
        console.log('Cancel')
        break
      case 'change_shipping':
        // TODO: Implement change shipping method action
        console.log('Change Shipping Method')
        break
      case 'download_invoice':
        // TODO: Implement download invoice action
        console.log('Download Invoice')
        break
      case 'export':
        // TODO: Implement export order action
        console.log('Export Order')
        break
      case 'merge':
        // TODO: Implement merge order action
        console.log('Merge Order')
        break
      case 'add':
        navigate({ to: '/orders/create' })
        break
      case 'upload':
        setOpen('import')
        break
      case 'after_sales':
        if (!table) {
          toast.error('Table not available')
          return
        }
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) {
          toast.error('Please select at least one order')
          return
        }
        if (selectedRows.length > 1) {
          toast.error('Please select only one order')
          return
        }
        setRmaDialogOpen(true)
        break
      case 'use_stock':
        // TODO: Implement use stock action
        console.log('Use Your Stock')
        break
      default:
        break
    }
  }

  return (
    <div className='flex gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='space-x-1'>
            <span>Actions</span>
            <ChevronDown size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[200px]'>
          <DropdownMenuItem onClick={() => handleAction('cancel')}>
            <X className='mr-2 h-4 w-4' />
            Cancel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('change_shipping')}>
            <Truck className='mr-2 h-4 w-4' />
            Change Shipping Method
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('download_invoice')}>
            <Download className='mr-2 h-4 w-4' />
            Download Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('export')}>
            <FileDown className='mr-2 h-4 w-4' />
            Export Order
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('merge')}>
            <Merge className='mr-2 h-4 w-4' />
            Merge Order
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('add')}>
            <Plus className='mr-2 h-4 w-4' />
            Add Order
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('upload')}>
            <Upload className='mr-2 h-4 w-4' />
            Upload Order
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('after_sales')}>
            <ShoppingBag className='mr-2 h-4 w-4' />
            After-Sales
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('use_stock')}>
            <Package className='mr-2 h-4 w-4' />
            Use Your Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('sync')}
      >
        <span>Sync Orders</span> <RefreshCw size={18} />
      </Button>

      <ConfirmDialog
        open={rmaDialogOpen}
        onOpenChange={(newOpen) => {
          if (!isCreatingRMA) {
            setRmaDialogOpen(newOpen)
          }
        }}
        handleConfirm={handleCreateRMA}
        isLoading={isCreatingRMA}
        title='Create RMA Order'
        desc='Creating RMA order...'
        confirmText={
          isCreatingRMA ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Creating...
            </>
          ) : (
            'Confirm'
          )
        }
      />
    </div>
  )
}
