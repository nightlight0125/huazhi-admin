import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { 
  MoreHorizontal, 
  MessageSquare, 
  X, 
  Pause, 
  Play, 
  Package, 
  Truck, 
  Download, 
  FileDown 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Order } from '../data/schema'
import { useOrders } from './orders-provider'
import { OrdersConfirmDialog } from './orders-confirm-dialog'
import { OrdersChangeShippingDialog } from './orders-change-shipping-dialog'

interface DataTableRowActionsProps {
  row: Row<Order>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useOrders()
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
  const [changeShippingDialog, setChangeShippingDialog] = useState(false)

  const handleSingleAction = (action: string) => {
    const order = row.original
    
    // 对于简单的操作，直接执行
    if (['download_invoice', 'export_order'].includes(action)) {
      console.log(`单个操作: ${action}`, order.id)
      // 这里应该调用相应的 API
      return
    }
    
    // 对于特殊的操作，打开专门的对话框
    if (action === 'change_shipping') {
      setChangeShippingDialog(true)
      return
    }
    
    // 对于需要确认的操作
    const actionNames = {
      quote: '询问报价',
      cancel: '取消订单',
      pause: '暂停订单',
      resume: '恢复订单',
      free_stock: '使用自由库存',
      cancel_payment: '取消付款'
    }
    
    setConfirmDialog({
      open: true,
      title: actionNames[action as keyof typeof actionNames],
      description: `确定要对订单 ${order.platformOrderNumber} 执行此操作吗？`,
      confirmText: '确认执行',
      onConfirm: () => {
        console.log(`单个操作: ${action}`, order.id)
        // 这里应该调用相应的 API
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem onClick={() => handleSingleAction('quote')}>
            <MessageSquare className='mr-2 h-4 w-4' />
            询问报价
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSingleAction('cancel')}>
            <X className='mr-2 h-4 w-4' />
            取消订单
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSingleAction('pause')}>
            <Pause className='mr-2 h-4 w-4' />
            暂停订单
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSingleAction('resume')}>
            <Play className='mr-2 h-4 w-4' />
            恢复订单
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSingleAction('free_stock')}>
            <Package className='mr-2 h-4 w-4' />
            使用自由库存
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSingleAction('change_shipping')}>
            <Truck className='mr-2 h-4 w-4' />
            更改发货方式
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSingleAction('cancel_payment')}>
            <X className='mr-2 h-4 w-4' />
            取消付款
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleSingleAction('download_invoice')}>
            <Download className='mr-2 h-4 w-4' />
            下载发票
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSingleAction('export_order')}>
            <FileDown className='mr-2 h-4 w-4' />
            导出订单
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OrdersConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
      />

      <OrdersChangeShippingDialog
        open={changeShippingDialog}
        onOpenChange={setChangeShippingDialog}
        order={row.original}
      />
    </>
  )
}
