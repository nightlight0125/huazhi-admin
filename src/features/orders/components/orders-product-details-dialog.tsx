import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Package } from 'lucide-react'
import { type Order } from '../data/schema'

interface OrdersProductDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function OrdersProductDetailsDialog({ open, onOpenChange, order }: OrdersProductDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>订单产品详情</DialogTitle>
          <DialogDescription>
            订单 {order.orderNumber} 的产品列表
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6'>
          {/* 订单基本信息 */}
          <div className='grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg'>
            <div>
              <div className='text-sm text-muted-foreground'>订单号</div>
              <div className='font-medium'>{order.orderNumber}</div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>客户</div>
              <div className='font-medium'>{order.customerName}</div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>总金额</div>
              <div className='font-bold text-primary'>¥{order.totalCost.toFixed(2)}</div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>产品数量</div>
              <div className='font-medium'>{order.productList.length} 个产品</div>
            </div>
          </div>

          {/* 产品列表 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Package className='h-5 w-5' />
              产品列表
            </h3>
            
            <div className='space-y-3'>
              {order.productList.map((product) => (
                <div key={product.id} className='border rounded-lg p-4'>
                  <div className='flex gap-4'>
                    {/* 产品图片 */}
                    <div className='flex-shrink-0'>
                      <img
                        src={product.productImageUrl}
                        alt={product.productName}
                        className='w-16 h-16 object-cover rounded border'
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                    </div>
                    
                    {/* 产品信息 */}
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h4 className='font-medium text-sm'>{product.productName}</h4>
                          <div className='text-xs text-muted-foreground mt-1'>
                            数量: {product.quantity} | 单价: ¥{product.price.toFixed(2)}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='font-medium'>¥{product.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* 产品变体 */}
                      {product.productVariant.length > 0 && (
                        <div className='flex flex-wrap gap-1'>
                          {product.productVariant.map((variant) => (
                            <Badge key={variant.id} variant='secondary' className='text-xs'>
                              {variant.name}: {variant.value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* 产品链接 */}
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-6 text-xs'
                          onClick={() => window.open(product.productLink, '_blank')}
                        >
                          <ExternalLink className='h-3 w-3 mr-1' />
                          查看产品
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 费用汇总 */}
          <div className='border-t pt-4'>
            <h3 className='text-lg font-semibold mb-3'>费用汇总</h3>
            <div className='grid grid-cols-3 gap-4'>
              <div className='text-center p-3 bg-muted/50 rounded'>
                <div className='text-sm text-muted-foreground'>运费</div>
                <div className='font-medium'>¥{order.shippingCost.toFixed(2)}</div>
              </div>
              <div className='text-center p-3 bg-muted/50 rounded'>
                <div className='text-sm text-muted-foreground'>其他费用</div>
                <div className='font-medium'>¥{order.otherCosts.toFixed(2)}</div>
              </div>
              <div className='text-center p-3 bg-primary/10 rounded'>
                <div className='text-sm text-muted-foreground'>总成本</div>
                <div className='font-bold text-primary'>¥{order.totalCost.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
