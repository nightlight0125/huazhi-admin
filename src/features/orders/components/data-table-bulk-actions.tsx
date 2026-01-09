import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { requestPayment } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { useOrders } from './orders-provider'
import { OrdersBulkActionsDialog } from './orders-bulk-actions-dialog'
import { OrdersMergeDialog } from './orders-merge-dialog'
import { OrdersConfirmDialog } from './orders-confirm-dialog'

interface DataTableBulkActionsProps {
  table: Table<any>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const { auth } = useAuthStore()
  const { setOpen } = useOrders()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    action: string
  }>({ open: false, action: '' })
  const [mergeDialog, setMergeDialog] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmText: string
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: '确认',
    onConfirm: () => {}
  })

  const handleBulkAction = (action: string) => {
    const selectedOrderIds = selectedRows.map((row) => row.original.id)

    // 对于简单的操作，直接执行
    if (['upload', 'export_orders', 'sort-by-date', 'sort-by-status', 'sort-by-amount'].includes(action)) {
      console.log(`批量操作: ${action}`, selectedOrderIds)
      // 这里应该调用相应的 API
      table.resetRowSelection()
      return
    }

    // 对于特殊的操作，打开专门的对话框
    if (action === 'merge_orders') {
      setMergeDialog(true)
      return
    }

    if (action === 'batch_payment') {
      void handleBatchPayment(selectedOrderIds)
      return
    }

    // 对于需要简单确认的操作
    if (['quote', 'pause', 'resume', 'free_stock', 'cancel_payment'].includes(action)) {
      const actionNames = {
        quote: '询问报价',
        pause: '暂停订单',
        resume: '恢复订单',
        free_stock: '使用自由库存',
        cancel_payment: '取消付款',
      }

      setConfirmDialog({
        open: true,
        title: `批量${actionNames[action as keyof typeof actionNames]}`,
        description: `确定要对选中的 ${selectedRows.length} 个订单执行此操作吗？`,
        confirmText: '确认执行',
        onConfirm: () => {
          console.log(`批量操作: ${action}`, selectedOrderIds)
          // 这里应该调用相应的 API
          table.resetRowSelection()
        },
      })
      return
    }

    // 对于其他需要确认的操作，打开通用对话框
    setBulkActionDialog({ open: true, action })
  }

  const handleBatchPayment = async (orderIds: string[]) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    if (orderIds.length === 0) {
      toast.error('Please select at least one order')
      return
    }

    try {
      await requestPayment({
        customerId: String(customerId),
        orderIds,
        type: 0, // 0 表示普通订单
      })

      toast.success(
        `Payment request submitted successfully for ${orderIds.length} order(s)`
      )
      // 清空选择
      table.resetRowSelection()
    } catch (error) {
      console.error('Failed to request batch payment:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to request batch payment. Please try again.'
      )
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='order'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkAction('upload')}
              className='size-8'
              aria-label='Upload or move up'
              title='Upload or move up'
            >
              <CircleArrowUp />
              <span className='sr-only'>Upload or move up</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload or move up</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Sort or reorder'
                  title='Sort or reorder'
                >
                  <ArrowUpDown />
                  <span className='sr-only'>Sort or reorder</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sort or reorder</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            <DropdownMenuItem onClick={() => handleBulkAction('sort-by-date')}>
              Sort by Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('sort-by-status')}>
              Sort by Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('sort-by-amount')}>
              Sort by Amount
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkAction('export_orders')}
              className='size-8'
              aria-label='Export orders'
              title='Export orders'
            >
              <Download />
              <span className='sr-only'>Export orders</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export orders</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setOpen('delete')}
              className='size-8'
              aria-label='Delete selected orders'
              title='Delete selected orders'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected orders</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected orders</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <OrdersBulkActionsDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => setBulkActionDialog({ open, action: '' })}
        action={bulkActionDialog.action}
        selectedOrders={selectedRows.map((row) => row.original)}
      />

      <OrdersMergeDialog
        open={mergeDialog}
        onOpenChange={setMergeDialog}
        selectedOrders={selectedRows.map((row) => row.original)}
      />


      <OrdersConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
      />
    </>
  )
}
