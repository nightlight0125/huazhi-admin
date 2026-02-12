import { ConfirmDialog } from '@/components/confirm-dialog'
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
import {
  addRMAOrder,
  queryAfterSaleReasonList,
  type AfterSaleReasonItem,
} from '@/lib/api/orders'
import { useAuthStore } from '@/stores/auth-store'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [afterSaleReasons, setAfterSaleReasons] = useState<AfterSaleReasonItem[]>([])
  const [isLoadingReasons, setIsLoadingReasons] = useState(false)
  const [selectedReasonId, setSelectedReasonId] = useState<string>('')
  const [dealType, setDealType] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const dealTypeOptions = [
    { label: 'Return and refund', value: 'A' },
    { label: 'Refund only', value: 'B' },
    { label: 'Reshipment', value: 'C' },
    { label: 'Returns only', value: 'D' },
  ] as const

  // 打开弹框时拉取售后原因列表
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

    // 表单必填校验
    if (!selectedOrderId) {
      toast.error('Order No is required')
      return
    }

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
      // 刷新订单列表
      table.resetRowSelection()
      setSelectedReasonId('')
      setDealType('')
      setDescription('')
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
        const order = selectedRows[0].original
        setSelectedOrderId(order.id)
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
            <div className='space-y-2'>
              <Label htmlFor='rma-order-no'>Order No</Label>
              <Input id='rma-order-no' value={selectedOrderId} disabled />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='rma-question-type'>Question type</Label>
              <Select
                value={selectedReasonId}
                onValueChange={setSelectedReasonId}
                disabled={isLoadingReasons || isCreatingRMA}
              >
                <SelectTrigger id='rma-question-type'>
                  <SelectValue placeholder={isLoadingReasons ? 'Loading...' : 'Please select'} />
                </SelectTrigger>
                <SelectContent>
                  {afterSaleReasons.map((item) => {
                    const label =
                      (typeof item.name === 'string' && item.name) ||
                      (typeof item.reason === 'string' && item.reason) ||
                      // 兜底：尽量用后端返回的可读字段
                      (typeof (item as any).label === 'string' && (item as any).label) ||
                      item.id ||
                      'Unknown'

                    const value = item.id ?? String((item as any).id || label)

                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='rma-deal-type'>Deal type</Label>
              <Select
                value={dealType}
                onValueChange={setDealType}
                disabled={isCreatingRMA}
              >
                <SelectTrigger id='rma-deal-type'>
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
            <Label htmlFor='rma-description'>Problem Description</Label>
            <Textarea
              id='rma-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Optional'
              disabled={isCreatingRMA}
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
