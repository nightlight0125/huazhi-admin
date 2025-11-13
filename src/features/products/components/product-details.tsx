import { useState } from 'react'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Palette,
  Plus,
  ShoppingCart,
  Store,
  Tag,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { type BrandItem } from '@/features/brands/data/schema'
import { packagingProducts } from '@/features/packaging-products/data/data'
import { type PackagingProduct } from '@/features/packaging-products/data/schema'
import { BrandCustomizationDialog } from '@/features/product-connections/components/brand-customization-dialog'
import { products } from '../data/data'
import { type Product } from '../data/schema'

export function ProductDetails() {
  const { productId } = useParams({
    from: '/_authenticated/products/$productId',
  })
  const search = useSearch({ from: '/_authenticated/products/$productId' })
  const navigate = useNavigate()
  const isFromPackagingProducts = search.from === 'packaging-products'
  // 查找产品数据 - 先查找普通产品，再查找包装产品
  const regularProduct = products.find((p) => p.id === productId)
  const packagingProduct = packagingProducts.find((p) => p.id === productId)
  const product = regularProduct || packagingProduct

  // 类型辅助：获取产品的共同属性
  const productData = product as Product | PackagingProduct

  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedTo, setSelectedTo] = useState('usa')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState('')
  const [isBrandCustomizationOpen, setIsBrandCustomizationOpen] =
    useState(false)
  const [selectedSellingPlatform, setSelectedSellingPlatform] =
    useState('shopify')
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState('tdpacket-electro')

  // 颜色选项
  const colorOptions = ['White', 'Pink', 'Purple', 'Dark Green', 'Black']

  // 复制SPU功能
  const handleCopySPU = () => {
    if (productData) {
      navigator.clipboard.writeText(productData.sku)
      // 可以添加toast提示
    }
  }

  if (!product) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold'>产品未找到</h2>
          <p className='text-muted-foreground mb-4'>请检查产品ID是否正确</p>
          <Button onClick={() => navigate({ to: '/products' })}>
            返回产品列表
          </Button>
        </div>
      </div>
    )
  }

  // 模拟店铺数据
  const stores = [
    { id: 'store1', name: '我的主店铺', value: 'store1' },
    { id: 'store2', name: '精品店铺', value: 'store2' },
    { id: 'store3', name: '特价店铺', value: 'store3' },
  ]

  const totalPrice = productData.price * selectedQuantity

  // 处理发布到店铺
  const handlePublishToStore = () => {
    if (!selectedStore) {
      alert('请选择一个店铺')
      return
    }

    const store = stores.find((s) => s.value === selectedStore)
    console.log(`发布产品 ${productData.name} 到店铺: ${store?.name}`)

    // 这里可以添加实际的发布逻辑
    alert(`产品已成功发布到 ${store?.name}`)
    setIsPublishDialogOpen(false)
    setSelectedStore('')
  }

  // 处理品牌定制
  const handleBrandConnect = (
    productId: string,
    brandType: keyof import('@/features/product-connections/data/schema').BrandConnection,
    brandItem: BrandItem
  ) => {
    console.log('连接品牌:', productId, brandType, brandItem)
    // 这里可以添加实际的连接逻辑
    alert(`产品 ${productId} 已连接品牌项目: ${brandItem.name}`)
  }

  const handleBrandDisconnect = (
    productId: string,
    brandType: keyof import('@/features/product-connections/data/schema').BrandConnection
  ) => {
    console.log('断开品牌连接:', productId, brandType)
    // 这里可以添加实际的断开连接逻辑
    alert(`产品 ${productId} 已断开品牌连接: ${brandType}`)
  }

  const handleBrandView = (brandItem: BrandItem) => {
    console.log('查看品牌项目:', brandItem)
    // 这里可以添加查看品牌项目的逻辑
    alert(`查看品牌项目: ${brandItem.name}`)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* 返回按钮 */}
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => navigate({ to: '/products' })}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Return to product list
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        {/* 左侧：产品图片和详情 */}
        <div className='lg:col-span-3'>
          <div>
            <CardContent className='p-0'>
              <div className='grid h-full grid-cols-1 md:grid-cols-2'>
                {/* 左侧：产品图片 */}
                <div className='flex flex-col'>
                  {/* 主图片 */}
                  <div className='aspect-square overflow-hidden rounded-t-lg md:rounded-t-none md:rounded-l-lg'>
                    <img
                      src={productData.image}
                      alt={productData.name}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  {/* 缩略图轮播 */}
                  <div className='p-4'>
                    <div className='flex gap-2 overflow-x-auto'>
                      {[
                        productData.image,
                        productData.image,
                        productData.image,
                      ].map((img, index) => (
                        <div
                          key={index}
                          className={`hover:border-primary/80 h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                            selectedThumbnail === index
                              ? 'border-primary'
                              : 'border-gray-300'
                          }`}
                          onClick={() => setSelectedThumbnail(index)}
                        >
                          <img
                            src={img}
                            alt={`${productData.name} ${index + 1}`}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右侧：产品详情 */}
                <div className='border-l p-6'>
                  <div className='space-y-6'>
                    {/* 产品标题和SPU */}
                    <div>
                      <h2 className='mb-3 text-2xl font-bold'>
                        {productData.name}
                      </h2>
                      <div className='flex items-center gap-2 text-sm'>
                        <span className='text-muted-foreground'>
                          HZ SPU: {productData.sku}
                        </span>
                        <button
                          onClick={handleCopySPU}
                          className='text-muted-foreground hover:text-foreground transition-colors'
                          title='Copy SPU'
                        >
                          <Copy className='h-4 w-4' />
                        </button>
                      </div>
                    </div>

                    {/* 价格和MOQ */}
                    <div className='flex items-center gap-4'>
                      <div className='text-3xl font-bold text-purple-600'>
                        ${productData.price.toFixed(2)}
                      </div>
                      <div className='rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm'>
                        MOQ: 1
                      </div>
                    </div>

                    {/* 颜色选项 */}
                    <div>
                      <Label className='mb-2 block text-sm font-medium'>
                        Color
                      </Label>
                      <div className='flex flex-wrap gap-2'>
                        {colorOptions.map((color) => (
                          <Button
                            key={color}
                            variant={
                              selectedColor === color ? 'default' : 'outline'
                            }
                            size='sm'
                            className='px-2s h-9 rounded-md border border-gray-300 bg-white text-sm font-normal hover:bg-gray-50'
                            onClick={() => setSelectedColor(color)}
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* 数量选择器 */}
                    <div>
                      <Label className='mb-2 block text-sm font-medium'>
                        QTY
                      </Label>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-9 w-9 rounded-md'
                            onClick={() =>
                              setSelectedQuantity(
                                Math.max(1, selectedQuantity - 1)
                              )
                            }
                          >
                            -
                          </Button>
                          <Input
                            type='number'
                            value={selectedQuantity}
                            onChange={(e) =>
                              setSelectedQuantity(
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            className='h-9 w-16 text-center'
                            min='1'
                          />
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-9 w-9 rounded-md'
                            onClick={() =>
                              setSelectedQuantity(selectedQuantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                        <span className='text-sm text-gray-600'>158g</span>
                      </div>
                    </div>

                    {/* 销售平台、发货地和物流方式 - 水平布局 */}
                    <div className='flex items-start gap-1.5 border-y py-3'>
                      {/* Selling On */}
                      <div className='flex flex-1 items-center gap-1.5'>
                        <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200'>
                          <Store className='h-3.5 w-3.5 text-gray-600' />
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                          <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
                            <span className='whitespace-nowrap'>
                              Selling On
                            </span>
                            <ChevronDown className='h-2.5 w-2.5 shrink-0' />
                          </div>
                          <Select
                            value={selectedSellingPlatform}
                            onValueChange={setSelectedSellingPlatform}
                          >
                            <SelectTrigger className='h-auto w-full border-0 p-0 shadow-none focus:ring-0 [&_span]:text-xs [&_span]:font-bold [&>svg]:hidden'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='shopify'>Shopify</SelectItem>
                              <SelectItem value='woocommerce'>
                                WooCommerce
                              </SelectItem>
                              <SelectItem value='ebay'>eBay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* 分隔线 */}
                      <div className='h-8 w-px shrink-0 bg-gray-200' />

                      {/* Ship To */}
                      <div className='flex flex-1 items-center gap-1.5'>
                        <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200'>
                          <Truck className='h-3.5 w-3.5 text-gray-600' />
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                          <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
                            <span className='whitespace-nowrap'>Ship To</span>
                            <ChevronDown className='h-2.5 w-2.5 shrink-0' />
                          </div>
                          <Select
                            value={selectedTo}
                            onValueChange={setSelectedTo}
                          >
                            <SelectTrigger className='h-auto w-full border-0 p-0 shadow-none focus:ring-0 [&_span]:text-xs [&_span]:font-bold [&>svg]:hidden'>
                              <SelectValue placeholder='选择目的地' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='usa'>United States</SelectItem>
                              <SelectItem value='uk'>United Kingdom</SelectItem>
                              <SelectItem value='canada'>Canada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* 分隔线 */}
                      <div className='h-8 w-px shrink-0 bg-gray-200' />

                      {/* By Shipping Method */}
                      <div className='flex flex-1 items-center gap-1.5'>
                        <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200'>
                          <Truck className='h-3.5 w-3.5 text-gray-600' />
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                          <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
                            <span className='whitespace-nowrap'>
                              By Shipping Method
                            </span>
                            <ChevronDown className='h-2.5 w-2.5 shrink-0' />
                          </div>
                          <div className='flex items-center gap-1'>
                            <Select
                              value={selectedShippingMethod}
                              onValueChange={setSelectedShippingMethod}
                            >
                              <SelectTrigger className='h-auto min-w-0 flex-1 border-0 p-0 shadow-none focus:ring-0 [&_span]:text-xs [&_span]:font-bold [&>svg]:hidden'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='tdpacket-electro'>
                                  TDPacket Electro
                                </SelectItem>
                                <SelectItem value='standard'>
                                  Standard Shipping
                                </SelectItem>
                                <SelectItem value='express'>
                                  Express Shipping
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className='flex shrink-0 items-center gap-0.5'>
                              <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
                              <span className='text-[10px] whitespace-nowrap text-green-600'>
                                Available
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 预计时间和费用 */}
                    <div className='space-y-2 border-t pt-4'>
                      <div className='text-sm'>
                        <span className='text-muted-foreground'>
                          Estimated Processing Time:{' '}
                        </span>
                        <span>1-3 days for 80% orders</span>
                      </div>
                      <div className='text-sm'>
                        <span className='text-muted-foreground'>
                          Estimated Shipping Time:{' '}
                        </span>
                        <span>8-15 days</span>
                      </div>
                      <div className='text-sm'>
                        <span className='text-muted-foreground'>
                          Shipping Fee:{' '}
                        </span>
                        <span className='font-semibold'>$6.99</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* 右侧：价格和操作 */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Recap</CardTitle>
            </CardHeader>

            <CardContent className='space-y-4'>
              {/* 变体信息 */}
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Variation Name</span>
                <span>{selectedColor || 'White'}</span>
              </div>

              {/* 价格信息 */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Product Price</span>
                  <span className='font-medium'>
                    ${productData.price.toFixed(2)}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Shipping Price</span>
                  <span className='font-medium'>$0</span>
                </div>
                <Separator />
                <div className='flex items-center justify-between text-lg font-bold'>
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className='space-y-2'>
                <Dialog
                  open={isPublishDialogOpen}
                  onOpenChange={setIsPublishDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className='w-full' size='lg'>
                      <Store className='mr-2 h-4 w-4' />
                      Publish To Store
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Publish To Store</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='store-select'>选择店铺</Label>
                        <Select
                          value={selectedStore}
                          onValueChange={setSelectedStore}
                        >
                          <SelectTrigger id='store-select'>
                            <SelectValue placeholder='请选择要发布的店铺' />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.value}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='bg-muted/50 space-y-2 rounded-lg p-3'>
                        <div className='text-sm font-medium'>产品信息</div>
                        <div className='text-muted-foreground text-sm'>
                          <div>产品名称: {productData.name}</div>
                          <div>SKU: {productData.sku}</div>
                          <div>价格: ${productData.price.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className='flex gap-2 pt-2'>
                        <Button
                          variant='outline'
                          className='flex-1'
                          onClick={() => setIsPublishDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button
                          className='flex-1'
                          onClick={handlePublishToStore}
                          disabled={!selectedStore}
                        >
                          确认发布
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant='outline'
                  className='w-full'
                  size='lg'
                  onClick={() =>
                    navigate({ to: `/products/${productData.id}/purchase` })
                  }
                >
                  <ShoppingCart className='mr-2 h-4 w-4' />
                  Buy Sample
                </Button>

                <Button
                  variant='outline'
                  className='w-full'
                  size='lg'
                  onClick={() => setIsBrandCustomizationOpen(true)}
                >
                  <Tag className='mr-2 h-4 w-4' />
                  Buy Stock
                </Button>

                <Button variant='outline' className='w-full' size='lg'>
                  <Plus className='mr-2 h-4 w-4' />
                  Collection
                </Button>

                {isFromPackagingProducts && (
                  <Button
                    variant='outline'
                    className='w-full'
                    size='lg'
                    onClick={() => {
                      navigate({ to: `/products/${productData.id}/design` })
                    }}
                  >
                    <Palette className='mr-2 h-4 w-4' />
                    Design
                  </Button>
                )}
              </div>

              {/* 喜欢按钮 */}
              {/* <div className='pt-4'>
                <Button variant='ghost' className='w-full'>
                  <Heart className='mr-2 h-4 w-4' />
                  喜欢这个产品
                </Button>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 产品描述 */}
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle>产品描述</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='prose max-w-none'>
            <p className='text-muted-foreground leading-relaxed'>
              多层设计：配备三个梯子和多个平台层，让小型动物可以奔跑、攀爬和玩耍，这个小型动物笼子是一个仓鼠游乐场豪宅。
              五层设置提供了充足的空间，让您的宠物可以自由活动，同时保持清洁和有序的环境。
            </p>
            <p className='text-muted-foreground mt-4 leading-relaxed'>
              高品质材料：采用天然木材制作，安全无毒，为您的宠物提供健康的生活环境。
              易于清洁的设计让日常维护变得简单，可拆卸的组件便于深度清洁。
            </p>
            <p className='text-muted-foreground mt-4 leading-relaxed'>
              多功能存储：底部配有储物架，可以存放宠物用品和食物，让您的生活空间更加整洁有序。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 品牌定制对话框 */}
      <BrandCustomizationDialog
        open={isBrandCustomizationOpen}
        onOpenChange={setIsBrandCustomizationOpen}
        productConnection={{
          id: productData.id,
          productImage: productData.image,
          productName: productData.name,
          price: productData.price,
          shippingFrom: 'beijing',
          shippingMethod: 'ds-economy-uk',
          shippingCost: 3.07,
          totalAmount: productData.price + 3.07,
          brandConnections: {
            logo: { connected: false },
            card: { connected: false },
            productPackaging: { connected: false },
            shippingPackaging: { connected: false },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        onConnect={handleBrandConnect}
        onDisconnect={handleBrandDisconnect}
        onView={handleBrandView}
      />
    </div>
  )
}
