import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import {
  ChevronDown,
  Download,
  FileDown,
  Loader2,
  Merge,
  ShoppingBag,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getOrderInvoicePdf } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type StockOrder } from '../data/schema'

interface StockOrdersActionsMenuProps {
  table?: Table<StockOrder> | null
}

export function StockOrdersActionsMenu({ table }: StockOrdersActionsMenuProps) {
  const { auth } = useAuthStore()
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false)

  const handleAction = (action: string) => {
    switch (action) {
      case 'cancel':
        // TODO: Implement cancel action
        break
      case 'download_invoice': {
        if (!table) {
          toast.error('Table not available')
          return
        }
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) {
          toast.error('Please select at least one order')
          return
        }
        const customerId = auth.user?.customerId || auth.user?.id
        if (!customerId) {
          toast.error('Customer ID not found')
          return
        }
        const ids = selectedRows.map((r) => r.original.id).filter(Boolean)
        if (ids.length === 0) {
          toast.error('Selected orders have no valid IDs')
          return
        }
        void (async () => {
          setIsDownloadingInvoice(true)
          try {
            const blob = await getOrderInvoicePdf(String(customerId), ids, '3')
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `invoice-stock-orders-${Date.now()}.pdf`
            a.click()
            URL.revokeObjectURL(url)
            toast.success(`Downloaded ${ids.length} invoice(s)`)
            table.resetRowSelection()
          } catch (error) {
            console.error('Failed to download invoice:', error)
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to download invoice. Please try again.'
            )
          } finally {
            setIsDownloadingInvoice(false)
          }
        })()
        break
      }
      case 'export':
        // TODO: Implement export order action
        break
      case 'merge':
        // TODO: Implement merge order action
        break
      case 'after_sales':
        // TODO: Implement batch payment action
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
        <DropdownMenuItem
          onClick={() => handleAction('download_invoice')}
          disabled={isDownloadingInvoice}
        >
          {isDownloadingInvoice ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Download className='mr-2 h-4 w-4' />
          )}
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
