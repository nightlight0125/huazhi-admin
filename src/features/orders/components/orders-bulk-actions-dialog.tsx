import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { logistics, shippingOrigins } from '../data/data'

interface OrdersBulkActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: string
  selectedOrders: any[]
}

export function OrdersBulkActionsDialog({ 
  open, 
  onOpenChange, 
  action, 
  selectedOrders 
}: OrdersBulkActionsDialogProps) {
  const [formData, setFormData] = useState({
    reason: '',
    note: '',
    shippingMethod: '',
    shippingOrigin: '',
  })

  const handleSubmit = () => {
    const orderIds = selectedOrders.map(order => order.id)
    console.log(`批量${action}:`, { orderIds, formData })
    onOpenChange(false)
    setFormData({ reason: '', note: '', shippingMethod: '', shippingOrigin: '' })
  }

  const getDialogTitle = () => {
    switch (action) {
      case 'quote': return '批量询问报价'
      case 'cancel': return '批量取消/重置订单'
      case 'pause': return '批量暂停订单'
      case 'resume': return '批量恢复订单'
      case 'free_stock': return '批量使用自由库存'
      case 'change_shipping': return '批量更改发货方式'
      case 'cancel_payment': return '批量取消付款'
      case 'download_invoice': return '批量下载发票'
      case 'export_orders': return '批量导出订单'
      case 'merge_orders': return '批量合并订单'
      case 'batch_payment': return '批量付款'
      default: return '批量操作'
    }
  }

  const getDialogDescription = () => {
    return `将对选中的 ${selectedOrders.length} 个订单执行此操作`
  }

  const renderFormFields = () => {
    switch (action) {
      case 'cancel':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='reason'>取消原因</Label>
              <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='选择取消原因' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='customer_request'>客户要求</SelectItem>
                  <SelectItem value='out_of_stock'>缺货</SelectItem>
                  <SelectItem value='payment_failed'>付款失败</SelectItem>
                  <SelectItem value='shipping_issue'>物流问题</SelectItem>
                  <SelectItem value='other'>其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='note'>备注</Label>
              <Textarea
                id='note'
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder='请输入取消原因详情...'
              />
            </div>
          </div>
        )

      case 'change_shipping':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='shippingMethod'>发货方式</Label>
              <Select value={formData.shippingMethod} onValueChange={(value) => setFormData({ ...formData, shippingMethod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='选择发货方式' />
                </SelectTrigger>
                <SelectContent>
                  {logistics.map((logistic) => (
                    <SelectItem key={logistic.value} value={logistic.value}>
                      {logistic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='shippingOrigin'>发货地</Label>
              <Select value={formData.shippingOrigin} onValueChange={(value) => setFormData({ ...formData, shippingOrigin: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='选择发货地' />
                </SelectTrigger>
                <SelectContent>
                  {shippingOrigins.map((origin) => (
                    <SelectItem key={origin.value} value={origin.value}>
                      {origin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'merge_orders':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='note'>合并说明</Label>
              <Textarea
                id='note'
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder='请输入合并订单的说明...'
              />
            </div>
            <div className='text-sm text-muted-foreground'>
              合并后的订单将包含所有选中订单的商品信息
            </div>
          </div>
        )

      case 'batch_payment':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='note'>付款备注</Label>
              <Textarea
                id='note'
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder='请输入付款备注...'
              />
            </div>
            <div className='text-sm text-muted-foreground'>
              将对所有选中订单执行付款操作
            </div>
          </div>
        )

      default:
        return (
          <div className='space-y-2'>
            <Label htmlFor='note'>操作备注</Label>
            <Textarea
              id='note'
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder='请输入操作备注...'
            />
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {renderFormFields()}
        
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            确认执行
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
