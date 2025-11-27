import {
  ChevronDown,
  Download,
  FileDown,
  Merge,
  ShoppingBag,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function StockOrdersActionsMenu() {
  const handleAction = (action: string) => {
    switch (action) {
      case 'cancel':
        // TODO: Implement cancel action
        console.log('Cancel')
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
      case 'after_sales':
        // TODO: Implement batch payment action
        console.log('After-SalesBatch')
        break
      default:
        break
    }
  }

  return (
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
        <DropdownMenuItem onClick={() => handleAction('after_sales')}>
          <ShoppingBag className='mr-2 h-4 w-4' />
          After-Sales Batch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

