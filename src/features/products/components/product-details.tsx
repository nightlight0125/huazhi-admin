import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
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
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ShippingOptionsDialog } from '@/components/shipping-options-dialog'
import { type BrandItem } from '@/features/brands/data/schema'
import { likedProductsData } from '@/features/liked-products/data/data'
import { packagingProducts } from '@/features/packaging-products/data/data'
import { type PackagingProduct } from '@/features/packaging-products/data/schema'
import { BrandCustomizationDialog } from '@/features/product-connections/components/brand-customization-dialog'
import { StoreListingTabs } from '@/features/store-management/components/store-listing-tabs'
import { createVariantPricingColumns } from '@/features/store-management/components/variant-pricing-columns'
import { mockVariantPricingData } from '@/features/store-management/components/variant-pricing-data'
import { type VariantPricing } from '@/features/store-management/components/variant-pricing-schema'
import { products } from '../data/data'
import { type Product } from '../data/schema'

export function ProductDetails() {
  const { productId } = useParams({
    from: '/_authenticated/products/$productId',
  })
  const search = useSearch({ from: '/_authenticated/products/$productId' })
  const navigate = useNavigate()
  const isFromPackagingProducts = search.from === 'packaging-products'
  const isFromLikedProducts = search.from === 'liked-products'

  // 查找产品数据 - 先查找普通产品，再查找包装产品
  let regularProduct = products.find((p) => p.id === productId)
  const packagingProduct = packagingProducts.find((p) => p.id === productId)

  // 如果从 liked-products 跳转过来，尝试通过 SPU 匹配产品
  if (isFromLikedProducts && !regularProduct) {
    const likedProduct = likedProductsData.find((p) => p.id === productId)
    if (likedProduct) {
      // 通过 SPU 匹配 products 中的产品
      regularProduct = products.find((p) => p.sku === likedProduct.spu)
    }
  }

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
  const [isShippingOptionsDialogOpen, setIsShippingOptionsDialogOpen] =
    useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false)
  const [isStoreListingOpen, setIsStoreListingOpen] = useState(false)
  const [storeListingSelectedTags, setStoreListingSelectedTags] = useState<
    string[]
  >([])
  const [storeListingTagsPopoverOpen, setStoreListingTagsPopoverOpen] =
    useState(false)
  const [storeListingRowSelection, setStoreListingRowSelection] =
    useState<RowSelectionState>({})
  const [storeListingSorting, setStoreListingSorting] = useState<SortingState>(
    []
  )
  const [storeListingColumnFilters, setStoreListingColumnFilters] =
    useState<ColumnFiltersState>([])

  // 颜色选项
  const colorOptions = ['White', 'Pink', 'Purple', 'Dark Green', 'Black']

  // 复制SPU功能
  const handleCopySPU = () => {
    if (productData) {
      navigator.clipboard.writeText(productData.sku)
      // 可以添加toast提示
    }
  }

  // 处理 Buy Sample 按钮点击：先检查地址（这里默认存在），弹出提示后再跳转
  const handleBuySampleClick = () => {
    const hasAddress = true

    if (hasAddress) {
      setIsAddressDialogOpen(true)
    } else {
      // 这里预留无地址时的处理，例如跳转到地址管理页
      // navigate({ to: '/account/address' })
    }
  }

  // 处理 Buy Stock 按钮点击：先检查仓库（这里默认存在），弹出提示后再跳转
  const handleBuyStockClick = () => {
    const hasWarehouse = true

    if (hasWarehouse) {
      setIsWarehouseDialogOpen(true)
    } else {
      // 这里预留无仓库时的处理，例如跳转到仓库管理页
      // navigate({ to: '/warehouse' })
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

  // 为 StoreListingTabs 准备 Variant Pricing 表格
  const variantPricingColumns = useMemo(() => createVariantPricingColumns(), [])
  const variantPricingData = useMemo(() => mockVariantPricingData, [])
  const variantPricingTable = useReactTable<VariantPricing>({
    data: variantPricingData,
    columns: variantPricingColumns,
    state: {
      rowSelection: storeListingRowSelection,
      sorting: storeListingSorting,
      columnFilters: storeListingColumnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setStoreListingRowSelection,
    onSortingChange: setStoreListingSorting,
    onColumnFiltersChange: setStoreListingColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // 处理发布到店铺：关闭弹框并显示 StoreListingTabs 组件
  const handlePublishToStore = () => {
    if (!selectedStore) {
      alert('请选择一个店铺')
      return
    }

    const store = stores.find((s) => s.value === selectedStore)
    console.log(`发布产品 ${productData.name} 到店铺: ${store?.name}`)

    // 这里可以添加实际的发布逻辑
    setIsPublishDialogOpen(false)
    setIsStoreListingOpen(true)
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
                      <div
                        className='flex flex-1 cursor-pointer items-center gap-1.5'
                        onClick={() => setIsShippingOptionsDialogOpen(true)}
                      >
                        <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200'>
                          <Store className='h-3.5 w-3.5 text-gray-600' />
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                          <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
                            <span className='whitespace-nowrap'>ship from</span>
                            <ChevronDown className='h-2.5 w-2.5 shrink-0' />
                          </div>
                          <Select
                            value={selectedSellingPlatform}
                            onValueChange={setSelectedSellingPlatform}
                          >
                            <SelectTrigger className='pointer-events-none h-auto w-full border-0 p-0 shadow-none focus:ring-0 [&_span]:text-xs [&_span]:font-bold [&>svg]:hidden'>
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
                      <div
                        className='flex flex-1 cursor-pointer items-center gap-1.5'
                        onClick={() => setIsShippingOptionsDialogOpen(true)}
                      >
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
                            <SelectTrigger className='pointer-events-none h-auto w-full border-0 p-0 shadow-none focus:ring-0 [&_span]:text-xs [&_span]:font-bold [&>svg]:hidden'>
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

        {/* 右侧：价格和操作（在桌面端固定在视窗内） */}
        <div className='lg:col-span-1 lg:self-start'>
          <div className='lg:fixed lg:top-28 lg:right-8 lg:w-[320px]'>
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
                    <span className='text-muted-foreground'>
                      Shipping Price
                    </span>
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
                          <div className='text-sm font-medium'>
                            product info
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            <div>name: {productData.name}</div>
                            <div>SKU: {productData.sku}</div>
                            <div>price: ${productData.price.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className='flex gap-2 pt-2'>
                          <Button
                            variant='outline'
                            className='flex-1'
                            onClick={() => setIsPublishDialogOpen(false)}
                          >
                            cancel
                          </Button>
                          <Button
                            className='flex-1'
                            onClick={handlePublishToStore}
                            disabled={!selectedStore}
                          >
                            confirm
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant='outline'
                    className='w-full'
                    size='lg'
                    onClick={handleBuySampleClick}
                  >
                    <ShoppingCart className='mr-2 h-4 w-4' />
                    Buy Sample
                  </Button>

                  <Button
                    variant='outline'
                    className='w-full'
                    size='lg'
                    onClick={handleBuyStockClick}
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

        {/* Store listing 右侧抽屉（使用 StoreListingTabs 公共组件） */}
        <Sheet open={isStoreListingOpen} onOpenChange={setIsStoreListingOpen}>
          <SheetContent
            side='right'
            className='flex h-full w-full flex-col sm:!w-[70vw] sm:!max-w-none'
          >
            <div className='flex h-full text-sm'>
              {/* 左侧：Listing 类型菜单（与 StoreManagement 保持一致） */}
              <div className='bg-muted/30 w-48 border-r px-3 py-4'>
                <div className='mb-2 text-sm font-semibold'>Manual Listing</div>
                <button className='bg-primary/10 text-primary hover:bg-primary/15 mb-1 flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors'>
                  Custom Editing
                </button>
                <div className='text-muted-foreground mt-4 mb-2 text-sm font-semibold'>
                  Template Listing
                </div>
                <button className='text-muted-foreground hover:bg-muted/50 flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors'>
                  Add New Template
                </button>
              </div>

              {/* 右侧：Tabs + 表单内容 */}
              <StoreListingTabs
                tagsPopoverOpen={storeListingTagsPopoverOpen}
                setTagsPopoverOpen={setStoreListingTagsPopoverOpen}
                selectedTags={storeListingSelectedTags}
                setSelectedTags={setStoreListingSelectedTags}
                variantPricingTable={variantPricingTable}
                columns={variantPricingColumns}
              />
            </div>

            {/* 底部操作按钮，保持与 /store-management 一致 */}
            <div className='flex items-center justify-end gap-2 border-t px-4 py-3'>
              <Button
                variant='outline'
                onClick={() => setIsStoreListingOpen(false)}
                className='min-w-[96px]'
              >
                Cancel
              </Button>
              <Button className='min-w-[120px]'>Confirm</Button>
            </div>
          </SheetContent>
        </Sheet>
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

      {/* 物流选择弹框 */}
      <ShippingOptionsDialog
        open={isShippingOptionsDialogOpen}
        onOpenChange={setIsShippingOptionsDialogOpen}
        defaultTo={
          selectedTo === 'usa'
            ? 'United States'
            : selectedTo === 'uk'
              ? 'United Kingdom'
              : selectedTo === 'canada'
                ? 'Canada'
                : 'France'
        }
        defaultQuantity={selectedQuantity}
        onSelect={(optionId) => {
          console.log('Selected shipping option:', optionId)
          // 这里可以处理选择后的逻辑
        }}
      />

      {/* 地址已存在提示弹框 */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Shipping Address</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm'>
            已存在收货地址，将使用该地址下单样品。
          </p>
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              variant='outline'
              onClick={() => setIsAddressDialogOpen(false)}
            >
              cancel
            </Button>
            <Button
              onClick={() => {
                setIsAddressDialogOpen(false)
                navigate({ to: `/products/PROD-1513/purchase` as any })
              }}
            >
              next
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 仓库已选择提示弹框 */}
      <Dialog
        open={isWarehouseDialogOpen}
        onOpenChange={setIsWarehouseDialogOpen}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Warehouse</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm'>
            已选择发货仓库，将使用该仓库准备库存。
          </p>
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              variant='outline'
              onClick={() => setIsWarehouseDialogOpen(false)}
            >
              cancel
            </Button>
            <Button
              onClick={() => {
                setIsWarehouseDialogOpen(false)
                navigate({ to: `/products/PROD-1513/purchase` as any })
              }}
            >
              next
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 地址已存在提示弹框 */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Shipping Address</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm'>
            已存在收货地址，将使用该地址下单样品。
          </p>
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              variant='outline'
              onClick={() => setIsAddressDialogOpen(false)}
            >
              cancel
            </Button>
            <Button
              onClick={() => {
                setIsAddressDialogOpen(false)
                navigate({ to: `/products/PROD-1513/purchase` as any })
              }}
            >
              next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
