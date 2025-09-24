import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { 
  Trash2, 
  MessageSquare, 
  RotateCcw, 
  Pause, 
  Play, 
  Package, 
  Truck, 
  X, 
  Download, 
  FileDown, 
  Merge, 
  CreditCard 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOrders } from './orders-provider'
import { OrdersBulkActionsDialog } from './orders-bulk-actions-dialog'
import { OrdersMergeDialog } from './orders-merge-dialog'
import { OrdersBatchPaymentDialog } from './orders-batch-payment-dialog'
import { OrdersConfirmDialog } from './orders-confirm-dialog'

interface DataTableBulkActionsProps {
  table: Table<any>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const { setOpen } = useOrders()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    action: string
  }>({ open: false, action: '' })
  const [mergeDialog, setMergeDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
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

  if (selectedRows.length === 0) {
    return null
  }

  const handleBulkAction = (action: string) => {
    const selectedOrderIds = selectedRows.map(row => row.original.id)
    
    // 对于简单的操作，直接执行
    if (['download_invoice', 'export_orders'].includes(action)) {
      console.log(`批量操作: ${action}`, selectedOrderIds)
      // 这里应该调用相应的 API
      return
    }
    
    // 对于特殊的操作，打开专门的对话框
    if (action === 'merge_orders') {
      setMergeDialog(true)
      return
    }
    
    if (action === 'batch_payment') {
      setPaymentDialog(true)
      return
    }
    
    // 对于需要简单确认的操作
    if (['quote', 'pause', 'resume', 'free_stock', 'cancel_payment'].includes(action)) {
      const actionNames = {
        quote: '询问报价',
        pause: '暂停订单',
        resume: '恢复订单',
        free_stock: '使用自由库存',
        cancel_payment: '取消付款'
      }
      
      setConfirmDialog({
        open: true,
        title: `批量${actionNames[action as keyof typeof actionNames]}`,
        description: `确定要对选中的 ${selectedRows.length} 个订单执行此操作吗？`,
        confirmText: '确认执行',
        onConfirm: () => {
          console.log(`批量操作: ${action}`, selectedOrderIds)
          // 这里应该调用相应的 API
        }
      })
      return
    }
    
    // 对于其他需要确认的操作，打开通用对话框
    setBulkActionDialog({ open: true, action })
  }

  return (
    <>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>
          已选择 {selectedRows.length} 个订单
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-8'>
              批量操作
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[200px]'>
            <DropdownMenuItem onClick={() => handleBulkAction('quote')}>
              <MessageSquare className='mr-2 h-4 w-4' />
              询问报价
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('cancel')}>
              <X className='mr-2 h-4 w-4' />
              取消/重置
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('pause')}>
              <Pause className='mr-2 h-4 w-4' />
              订单暂停
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('resume')}>
              <Play className='mr-2 h-4 w-4' />
              订单恢复
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('free_stock')}>
              <Package className='mr-2 h-4 w-4' />
              使用自由库存
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('change_shipping')}>
              <Truck className='mr-2 h-4 w-4' />
              更改发货方式
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('cancel_payment')}>
              <X className='mr-2 h-4 w-4' />
              取消付款
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => handleBulkAction('download_invoice')}>
              <Download className='mr-2 h-4 w-4' />
              下载发票
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('export_orders')}>
              <FileDown className='mr-2 h-4 w-4' />
              导出订单
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('merge_orders')}>
              <Merge className='mr-2 h-4 w-4' />
              合并订单
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleBulkAction('batch_payment')}>
              <CreditCard className='mr-2 h-4 w-4' />
              批量付款
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setOpen('delete')}
              className='text-destructive focus:text-destructive'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              删除订单
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <OrdersBulkActionsDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => setBulkActionDialog({ open, action: '' })}
        action={bulkActionDialog.action}
        selectedOrders={selectedRows.map(row => row.original)}
      />

      <OrdersMergeDialog
        open={mergeDialog}
        onOpenChange={setMergeDialog}
        selectedOrders={selectedRows.map(row => row.original)}
      />

      <OrdersBatchPaymentDialog
        open={paymentDialog}
        onOpenChange={setPaymentDialog}
        selectedOrders={selectedRows.map(row => row.original)}
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
