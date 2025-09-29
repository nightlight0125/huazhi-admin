import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Eye, Trash2, Palette, CreditCard, Package, Truck } from 'lucide-react'
import { type ProductConnection, type BrandConnection } from '../data/schema'
import { getAllBrandItems } from '@/features/brands/data/data'
import { type BrandItem } from '@/features/brands/data/schema'

interface BrandCustomizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productConnection: ProductConnection | null
  onConnect: (productId: string, brandType: keyof BrandConnection, brandItem: BrandItem) => void
  onDisconnect: (productId: string, brandType: keyof BrandConnection) => void
  onView: (brandItem: BrandItem) => void
}

const brandTypeConfig = {
  logo: {
    label: 'Logo',
    icon: Palette,
    description: '企业品牌标识和Logo设计',
  },
  card: {
    label: '心愿卡',
    icon: CreditCard,
    description: '名片和商务卡片设计',
  },
  productPackaging: {
    label: '产品包装',
    icon: Package,
    description: '产品包装盒和标签设计',
  },
  shippingPackaging: {
    label: '运输包装',
    icon: Truck,
    description: '运输包装和物流标签设计',
  },
}

export function BrandCustomizationDialog({
  open,
  onOpenChange,
  productConnection,
  onConnect,
  onDisconnect,
  onView,
}: BrandCustomizationDialogProps) {
  const [brandItems, setBrandItems] = useState<BrandItem[]>([])
  const [selectedBrandType, setSelectedBrandType] = useState<keyof BrandConnection | null>(null)

  useEffect(() => {
    if (open) {
      const items = getAllBrandItems()
      setBrandItems(items)
      setSelectedBrandType(null)
    }
  }, [open])

  const getConnectionStatus = (brandType: keyof BrandConnection) => {
    if (!productConnection?.brandConnections) return false
    return productConnection.brandConnections[brandType]?.connected || false
  }

  const getConnectedBrandItem = (brandType: keyof BrandConnection) => {
    if (!productConnection?.brandConnections) return null
    const connection = productConnection.brandConnections[brandType]
    if (!connection?.connected || !connection.brandItemId) return null
    return brandItems.find(item => item.id === connection.brandItemId) || null
  }

  const getBrandItemsByType = (brandType: keyof BrandConnection) => {
    return brandItems.filter(item => item.brandType === brandType)
  }

  const handleConnect = (brandItem: BrandItem) => {
    if (productConnection) {
      // 将 snake_case 转换为 camelCase
      const brandTypeMap = {
        'logo': 'logo',
        'card': 'card', 
        'product_packaging': 'productPackaging',
        'shipping_packaging': 'shippingPackaging'
      } as const
      
      const brandType = brandTypeMap[brandItem.brandType] as keyof BrandConnection
      onConnect(productConnection.id, brandType, brandItem)
    }
  }

  const handleDisconnect = (brandType: keyof BrandConnection) => {
    if (productConnection) {
      onDisconnect(productConnection.id, brandType)
    }
  }

  const handleView = (brandItem: BrandItem) => {
    onView(brandItem)
  }

  if (!productConnection) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>品牌定制 - {productConnection.productName.split('\n')[0]}</DialogTitle>
          <DialogDescription>
            为产品选择品牌组件，包括Logo、心愿卡、产品包装和运输包装
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {!selectedBrandType ? (
            /* 品牌类型选择 */
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>选择品牌类型</h3>
              <div className='grid grid-cols-2 gap-4'>
                {Object.entries(brandTypeConfig).map(([key, config]) => {
                  const brandType = key as keyof BrandConnection
                  const isConnected = getConnectionStatus(brandType)
                  const connectedItem = getConnectedBrandItem(brandType)
                  const IconComponent = config.icon
                  
                  return (
                    <div
                      key={key}
                      className='rounded-lg border p-4 hover:shadow-md transition-shadow'
                    >
                      <div className='mb-4 flex items-center justify-between'>
                        <div className='bg-muted flex size-10 items-center justify-center rounded-lg p-2'>
                          <IconComponent className='h-5 w-5' />
                        </div>
                        <div className='flex items-center gap-2'>
                          {isConnected ? (
                            <CheckCircle className='h-5 w-5 text-green-500' />
                          ) : (
                            <XCircle className='h-5 w-5 text-red-500' />
                          )}
                        </div>
                      </div>
                      <div className='mb-4'>
                        <h4 className='mb-1 font-semibold'>{config.label}</h4>
                        <p className='text-sm text-muted-foreground mb-2'>{config.description}</p>
                        {isConnected && connectedItem && (
                          <p className='text-xs text-green-600'>已连接: {connectedItem.name}</p>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        {isConnected ? (
                          <>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleView(connectedItem!)}
                              className='flex-1'
                            >
                              <Eye className='h-4 w-4 mr-1' />
                              查看
                            </Button>
                            <Button
                              variant='destructive'
                              size='sm'
                              onClick={() => handleDisconnect(brandType)}
                              className='flex-1'
                            >
                              <Trash2 className='h-4 w-4 mr-1' />
                              移除
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => setSelectedBrandType(brandType)}
                            className='w-full'
                          >
                            选择
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* 品牌项目选择 */
            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedBrandType(null)}
                >
                  ← 返回
                </Button>
                <h3 className='text-lg font-semibold'>
                  选择{brandTypeConfig[selectedBrandType].label}品牌项目
                </h3>
              </div>
              <div className='border rounded-lg'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>尺寸</TableHead>
                      <TableHead>文件类型</TableHead>
                      <TableHead>文件名</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getBrandItemsByType(selectedBrandType).map((item) => {
                      const isConnected = getConnectionStatus(selectedBrandType)
                      const connectedItem = getConnectedBrandItem(selectedBrandType)
                      const isThisItemConnected = connectedItem?.id === item.id
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className='font-medium'>{item.name}</TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {item.size === 'large' ? '大' : item.size === 'medium' ? '中' : '小'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant='secondary'>
                              {item.fileType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {item.fileName}
                          </TableCell>
                          <TableCell>
                            {isThisItemConnected ? (
                              <span className='text-sm text-green-600'>已连接</span>
                            ) : isConnected ? (
                              <span className='text-sm text-muted-foreground'>该类型已连接</span>
                            ) : (
                              <Button
                                variant='default'
                                size='sm'
                                onClick={() => handleConnect(item)}
                              >
                                连接
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
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
