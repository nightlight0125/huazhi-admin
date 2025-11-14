import {
  ChevronDown,
  Download,
  FileDown,
  Merge,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Truck,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOrders } from './orders-provider'

export function OrdersPrimaryButtons() {
  const { setOpen } = useOrders()

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
        setOpen('create')
        break
      case 'upload':
        setOpen('import')
        break
      case 'after_sales':
        // TODO: Implement after-sales action
        console.log('After-Sales')
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
    </div>
  )
}
