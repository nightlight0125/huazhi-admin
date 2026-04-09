import { useEffect, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { ChevronDown, Download, Loader2, ShoppingBag, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  addRMAOrder,
  getOrderInvoicePdf,
  queryAfterSaleReasonList,
  updateOrderCancelStatus,
  type AfterSaleReasonItem,
} from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type SampleOrder } from '../data/schema'

interface SampleOrdersActionsMenuProps {
  table?: Table<SampleOrder> | null
  /** Called after a successful cancel so the list can refresh */
  onRefresh?: () => void
}

export function SampleOrdersActionsMenu({
  table,
  onRefresh,
}: SampleOrdersActionsMenuProps) {
  const { auth } = useAuthStore()
  const [rmaDialogOpen, setRmaDialogOpen] = useState(false)
  const [isCreatingRMA, setIsCreatingRMA] = useState(false)
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false)
  const [selectedOrderNo, setSelectedOrderNo] = useState('')
  const [selectedReasonId, setSelectedReasonId] = useState('')
  const [dealType, setDealType] = useState('')
  const [description, setDescription] = useState('')
  const [afterSaleReasons, setAfterSaleReasons] = useState<
    AfterSaleReasonItem[]
  >([])
  const [isLoadingReasons, setIsLoadingReasons] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [isCancellingOrder, setIsCancellingOrder] = useState(false)
  const [pendingCancelOrder, setPendingCancelOrder] = useState<{
    id: string
    orderNumber: string
  } | null>(null)
  const dealTypeOptions = [
    { label: 'Return and refund', value: 'A' },
    { label: 'Refund only', value: 'B' },
    { label: 'Reshipment', value: 'C' },
    { label: 'Returns only', value: 'D' },
  ] as const

  const getOrderStatus = (order: SampleOrder) =>
    String((order as any).hzkj_orderstatus ?? '')

  useEffect(() => {
    if (!rmaDialogOpen || afterSaleReasons.length > 0) return

    const fetchReasons = async () => {
      try {
        setIsLoadingReasons(true)
        const rows = await queryAfterSaleReasonList(1, 50)
        setAfterSaleReasons(rows)
      } catch (error) {
        console.error('获取售后原因列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load question types. Please try again.'
        )
      } finally {
        setIsLoadingReasons(false)
      }
    }

    void fetchReasons()
  }, [rmaDialogOpen, afterSaleReasons.length])

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

    const hasUnpaidOrder = selectedRows.some(
      (row) => getOrderStatus(row.original) !== '2'
    )
    if (hasUnpaidOrder) {
      toast.error('Unpaid orders do not support after-sales.')
      return
    }

    const customerId = auth.user?.customerId || auth.user?.id
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    const order = selectedRows[0].original
    if (!selectedReasonId) {
      toast.error('Question type is required')
      return
    }
    if (!dealType) {
      toast.error('Deal type is required')
      return
    }
    setIsCreatingRMA(true)

    try {
      await addRMAOrder({
        customerId: String(customerId),
        orderId: order.id,
        salesType: dealType,
        reason: selectedReasonId,
        cusNote: description || undefined,
      })
      toast.success('RMA order created successfully')
      setRmaDialogOpen(false)
      setSelectedReasonId('')
      setSelectedOrderNo('')
      setDealType('')
      setDescription('')
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

  const openCancelConfirm = () => {
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
    const order = selectedRows[0].original
    const status = String((order as any).hzkj_orderstatus ?? '')
    if (status !== '1') {
      toast.error('Only orders pending payment can be cancelled.')
      return
    }
    setPendingCancelOrder({
      id: order.id,
      orderNumber:
        (order as any).billno || order.orderNumber || order.id,
    })
    setCancelConfirmOpen(true)
  }

  const handleConfirmCancelOrder = async () => {
    const customerId = auth.user?.customerId || auth.user?.id
    if (!customerId || !pendingCancelOrder) return
    setIsCancellingOrder(true)
    try {
      await updateOrderCancelStatus({
        customerId: String(customerId),
        orderId: String(pendingCancelOrder.id),
        orderType: 'sampleOrder',
      })
      toast.success('Order cancelled successfully')
      setCancelConfirmOpen(false)
      setPendingCancelOrder(null)
      table?.resetRowSelection()
      onRefresh?.()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to cancel order. Please try again.'
      )
    } finally {
      setIsCancellingOrder(false)
    }
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'cancel':
        openCancelConfirm()
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
            const blob = await getOrderInvoicePdf(String(customerId), ids, '2')
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `invoice-sample-orders-${Date.now()}.pdf`
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
        break
      case 'merge':
        // TODO: Implement merge order action
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
        if (selectedRows.length > 1) {
          toast.error('Please select only one order')
          return
        }
        const hasUnpaidOrder = selectedRows.some(
          (row) => getOrderStatus(row.original) !== '2'
        )
        if (hasUnpaidOrder) {
          toast.error('Unpaid orders do not support after-sales.')
          return
        }
        const order = selectedRows[0].original
        setSelectedOrderNo(order.billno || order.orderNumber || order.id)
        setSelectedReasonId('')
        setDealType('')
        setDescription('')
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
        <DropdownMenuItem onClick={() => handleAction('after_sales')}>
          <ShoppingBag className='mr-2 h-4 w-4' />
          After-Sales Batch
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={(open) => {
          if (!isCancellingOrder) {
            setCancelConfirmOpen(open)
            if (!open) setPendingCancelOrder(null)
          }
        }}
        handleConfirm={() => void handleConfirmCancelOrder()}
        destructive
        isLoading={isCancellingOrder}
        title='Cancel order'
        desc={
          <>
            <p className='mb-2'>Are you sure you want to cancel this order?</p>
            {pendingCancelOrder ? (
              <p className='text-muted-foreground text-sm'>
                Order number:{' '}
                <strong>{pendingCancelOrder.orderNumber}</strong>
              </p>
            ) : null}
          </>
        }
        confirmText={
          isCancellingOrder ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Cancelling...
            </>
          ) : (
            'Confirm'
          )
        }
      />

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
        desc=''
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
      >
        <div className='mt-4 space-y-4'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='min-w-0 space-y-2'>
              <Label htmlFor='sample-rma-order-no'>Order No</Label>
              <Input
                id='sample-rma-order-no'
                value={selectedOrderNo}
                disabled
              />
            </div>
            <div className='min-w-0 space-y-2'>
              <Label htmlFor='sample-rma-question-type'>Question type</Label>
              <Select
                value={selectedReasonId}
                onValueChange={setSelectedReasonId}
                disabled={isLoadingReasons || isCreatingRMA}
              >
                <SelectTrigger
                  id='sample-rma-question-type'
                  className='w-full min-w-0'
                >
                  <SelectValue
                    className='block max-w-full truncate'
                    placeholder={
                      isLoadingReasons ? 'Loading...' : 'Please select'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {afterSaleReasons.map((item) => {
                    const label =
                      (typeof item.name === 'string' && item.name) ||
                      (typeof item.reason === 'string' && item.reason) ||
                      (typeof (item as any).label === 'string' &&
                        (item as any).label) ||
                      item.id ||
                      'Unknown'
                    const value = item.id ?? String((item as any).id || label)

                    return (
                      <SelectItem
                        key={value}
                        value={value}
                        className='max-w-80'
                      >
                        <span className='block truncate' title={label}>
                          {label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='sample-rma-deal-type'>Deal type</Label>
              <Select
                value={dealType}
                onValueChange={setDealType}
                disabled={isCreatingRMA}
              >
                <SelectTrigger id='sample-rma-deal-type'>
                  <SelectValue placeholder='Please select' />
                </SelectTrigger>
                <SelectContent>
                  {dealTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='sample-rma-description'>Problem Description</Label>
            <Textarea
              id='sample-rma-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Optional'
              disabled={isCreatingRMA}
            />
          </div>
        </div>
      </ConfirmDialog>
    </DropdownMenu>
  )
}
