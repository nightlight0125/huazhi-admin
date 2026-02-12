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
import { addRMAOrder } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type SampleOrder } from '../data/schema'

interface SampleOrdersActionsMenuProps {
  table?: Table<SampleOrder> | null
}

export function SampleOrdersActionsMenu({
  table,
}: SampleOrdersActionsMenuProps) {
  const { auth } = useAuthStore()
  const [rmaDialogOpen, setRmaDialogOpen] = useState(false)
  const [isCreatingRMA, setIsCreatingRMA] = useState(false)

  const handleAfterSales = async () => {
    if (!table) {
      toast.error('Table not available')
      return
    }

    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error('Please select')
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
        salesType: 'A', // 默认值：A-Return and refund
        reason: '', // 默认值：空字符串，实际使用时应该从对话框获取
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
        // 检查是否有选中的行
        if (!table) {
          toast.error('Table not available')
          return
        }
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) {
          toast.error('Please select')
          return
        }
        // 打开弹框
        setRmaDialogOpen(true)
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
      <ConfirmDialog
        open={rmaDialogOpen}
        onOpenChange={(newOpen) => {
          if (!isCreatingRMA) {
            setRmaDialogOpen(newOpen)
          }
        }}
        handleConfirm={handleAfterSales}
        isLoading={isCreatingRMA}
        title='Create RMA Order'
        desc='Creating order...'
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
    </DropdownMenu>
  )
}
