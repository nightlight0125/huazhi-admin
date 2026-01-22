import { ConfirmDialog } from '@/components/confirm-dialog'
import { ShippingOptionsDialog } from '@/components/shipping-options-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type BrandItem } from '@/features/brands/data/schema'
import { likedProductsData } from '@/features/liked-products/data/data'
import { packagingProducts } from '@/features/packaging-products/data/data'
import { BrandCustomizationDialog } from '@/features/product-connections/components/brand-customization-dialog'
import { StoreListingTabs } from '@/features/store-management/components/store-listing-tabs'
import { createVariantPricingColumns } from '@/features/store-management/components/variant-pricing-columns'
import { mockVariantPricingData } from '@/features/store-management/components/variant-pricing-data'
import { type VariantPricing } from '@/features/store-management/components/variant-pricing-schema'
import {
  calcuFreight,
  getStatesList,
  queryCountry,
  type CountryItem,
  type FreightOption,
  type StateItem,
} from '@/lib/api/logistics'
import {
  collectProduct,
  getProduct,
  querySkuByCustomer,
  type ApiProductItem,
  type SkuRecordItem,
} from '@/lib/api/products'
import { getUserShop } from '@/lib/api/shop'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import type { ShopInfo } from '@/stores/shop-store'
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
  Heart,
  Loader2,
  Palette,
  ShoppingCart,
  Store,
  Tag,
  Truck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import countries from 'world-countries'
import { products } from '../data/data'
import { type Product } from '../data/schema'
import {
  ConfirmOrderView,
  type ConfirmOrderPayload,
} from './confirm-order-view'
import { ProductPurchaseDialog } from './product-purchase-dialog'

type CountryOption = {
  value: string
  label: string
  flagClass: string
  id?: string // 国家ID
}


// 将国家/地区数据转换为 CountryOption 格式
function mapCountriesToCountryOptions(countriesData: CountryItem[]): CountryOption[] {
  return countriesData.map((country) => {
    // 优先使用 twocountrycode，如果没有则使用 hzkj_code
    const countryCode = country.twocountrycode || country.hzkj_code
    
    // 在 world-countries 库中查找对应的国家信息
    const countryInfo = countryCode
      ? countries.find(
          (c) => c.cca2.toUpperCase() === countryCode.toUpperCase()
        )
      : null

    // 生成国旗图标类名
    const code = countryInfo?.cca2.toLowerCase() || countryCode?.toLowerCase() || ''
    const flagClass = code ? `fi fi-${code}` : ''

    return {
      value: countryCode || country.hzkj_code || country.id || '',
      label: country.hzkj_name || country.name || '',
      flagClass,
      id: country.id,
    }
  })
}

// 处理选择国家并计算运费
async function handleCountrySelectAndCalculateFreight(
  productId: string,
  country: { value: string; id?: string },
  statesData: StateItem[],
  setShippingMethodOptions: (
    options: Array<{
      id: string
      title: string
      cost: string
      deliveryTime: string
    }>
  ) => void,
  setSelectedDestinationId: (id: string) => void,
  setIsLoadingFreight: (loading: boolean) => void
) {
  if (!productId || !country.value) {
    return
  }

  setIsLoadingFreight(true)
  try {
    // 获取国家ID
    const countryId =
      country.id ||
      statesData.find(
        (s) => s.hzkj_code?.toUpperCase() === country.value.toUpperCase()
      )?.id
    console.log('countryId------------111:', countryId)

    if (!countryId) {
      toast.error('Failed to get country ID. Please try again.')
      return
    }

    const freightOptions = await calcuFreight({
      spuId: productId,
      destinationId: countryId,
    })

    // 转换API返回的数据格式：logsNumber -> title, freight -> cost, time -> deliveryTime
    const formattedOptions = freightOptions.map((option: FreightOption) => ({
      id: option.logsId || String(Math.random()),
      title: option.logsNumber || '',
      cost: `$${option.freight?.toFixed(2) || '0.00'}`,
      deliveryTime: option.time || '',
    }))

    // 如果后端返回空数组，就设置为空数组
    setShippingMethodOptions(formattedOptions)
    setSelectedDestinationId(countryId)
  } catch (error) {
    console.error('Failed to calculate freight:', error)
    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to calculate freight. Please try again.'
    )
    // 发生错误时设置为空数组
    setShippingMethodOptions([])
  } finally {
    setIsLoadingFreight(false)
  }
}

export function ProductDetails() {
  const { productId } = useParams({
    from: '/_authenticated/products/$productId',
  })
  const search = useSearch({ from: '/_authenticated/products/$productId' })
  const navigate = useNavigate()
  const from = search.from as string | undefined
  const isFromPackagingProducts =
    from?.startsWith('packaging-products') ?? false
  const isFromLikedProducts = from === 'liked-products'
  const isFromWinningProducts = from === 'winning-products'
  const isFromAllProducts = from === 'all-products'
  const shouldShowCollectionButton = isFromWinningProducts || isFromAllProducts
  const packagingTab =
    from === 'packaging-products-my'
      ? 'my-packaging'
      : from === 'packaging-products'
        ? 'packaging-products'
        : undefined
  const shouldShowBuyStockInPackaging =
    isFromPackagingProducts && packagingTab === 'my-packaging'
  const shouldShowMyPackagingButton = !(
    isFromPackagingProducts && packagingTab === 'my-packaging'
  )

  // 状态声明
  const [apiProduct, setApiProduct] = useState<ApiProductItem | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [richTextContent, setRichTextContent] = useState<string>('')

  // 从 API 获取产品详情
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      setIsLoadingProduct(true)
      try {
        const productData = await getProduct(productId)
        setApiProduct(productData)
        // 提取富文本内容
        if (productData) {
          const richtext = (productData as Record<string, unknown>)
            .hzkj_richtextfield
          setRichTextContent(typeof richtext === 'string' ? richtext : '')
        } else {
          setRichTextContent('')
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load product. Please try again.'
        )
        setApiProduct(null)
        setRichTextContent('')
      } finally {
        setIsLoadingProduct(false)
      }
    }

    void fetchProduct()
  }, [productId])

  // 辅助函数：从可能的多语言对象中提取名称
  const extractName = (name: unknown): string => {
    if (typeof name === 'string') {
      return name
    }
    if (name && typeof name === 'object') {
      // 如果是对象，尝试获取 zh_CN 或 GLang 或第一个字符串值
      const nameObj = name as Record<string, unknown>
      return (
        (nameObj.zh_CN as string) ||
        (nameObj.GLang as string) ||
        (nameObj.en as string) ||
        (Object.values(nameObj).find((v) => typeof v === 'string') as string) ||
        ''
      )
    }
    return ''
  }

  // 将 API 返回的产品数据转换为组件需要的格式
  const convertApiProductToProduct = (
    apiProduct: ApiProductItem | null
  ): Product | null => {
    if (!apiProduct) return null

    // 尝试从本地数据中找到匹配的产品以获取完整信息
    const localProduct = products.find((p) => p.id === apiProduct.id)
    if (localProduct) {
      return localProduct
    }

    // 提取名称（处理可能是对象的情况）
    const productName = extractName(apiProduct.name)
    // 处理图片 URL（确保不是空字符串）
    const productImage =
      apiProduct.picture && apiProduct.picture.trim() !== ''
        ? apiProduct.picture
        : 'https://via.placeholder.com/400?text=No+Image'

    // 如果没有本地数据，创建一个基本的产品对象
    const picUrl = apiProduct.hzkj_picurl_tag
    const purPrice = apiProduct.hzkj_pur_price

    return {
      id: apiProduct.id,
      name: productName,
      image:
        (typeof picUrl === 'string' ? picUrl : productImage) ||
        'https://via.placeholder.com/400?text=No+Image',
      shippingLocation: 'china', // 默认值
      price: (typeof purPrice === 'number' ? purPrice : apiProduct.price) ?? 0, // 如果 price 不存在，默认为 0
      sku: apiProduct.number || apiProduct.id,
      category: 'electronics', // 默认值
      sales: 0,
      isPublic: true,
      isRecommended: false,
      isFavorite: false,
      isMyStore: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(apiProduct.hzkj_sku_spec_e && {
        hzkj_sku_spec_e: apiProduct.hzkj_sku_spec_e,
      }),
    } as Product & { hzkj_sku_spec_e?: unknown }
  }

  // 优先使用 API 数据，如果没有则使用本地数据
  const apiProductConverted = convertApiProductToProduct(apiProduct)

  let regularProduct =
    apiProductConverted || products.find((p) => p.id === productId)
  const packagingProduct = packagingProducts.find((p) => p.id === productId)

  if (isFromLikedProducts && !regularProduct) {
    const likedProduct = likedProductsData.find((p) => p.id === productId)
    if (likedProduct) {
      regularProduct = products.find((p) => p.sku === likedProduct.spu)
    }
  }

  const product = regularProduct || packagingProduct

  // 确保 productData 的名称是字符串（处理可能是对象的情况）
  const productData = product
    ? {
        ...product,
        name:
          typeof product.name === 'string'
            ? product.name
            : extractName(product.name),
        image:
          product.image && product.image.trim() !== ''
            ? product.image
            : 'https://via.placeholder.com/400?text=No+Image',
      }
    : null

  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
  const [statesData, setStatesData] = useState<StateItem[]>([])

  useEffect(() => {
    const loadCountries = async () => {
      try {
        // 使用 queryCountry API 获取国家/地区列表
        const countriesData = await queryCountry(1, 1000)
        console.log('countries data:', countriesData)

        // 使用工具函数将国家数据转换为CountryOption格式
        const countryOptionsData = mapCountriesToCountryOptions(countriesData)
        setCountryOptions(countryOptionsData)

        // 同时获取州/省数据（用于运费计算）
        const states = await getStatesList(1, 1000)
        console.log('states:', states)
        setStatesData(states)
      } catch (error) {
        console.error('Failed to load countries:', error)
        // 如果API失败，使用空数组
        setCountryOptions([])
      }
    }

    void loadCountries()
  }, [])

  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedTo, setSelectedTo] = useState<string>('')
  // 规格选择状态：key 是规格ID，value 是选中的规格值ID
  const [selectedSpecs, setSelectedSpecs] = useState<
    Record<string, string>
  >({})
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState('')
  const [stores, setStores] = useState<
    Array<{ id: string; name: string; value: string }>
  >([])
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const { auth } = useAuthStore()
  const [isCollectDialogOpen, setIsCollectDialogOpen] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)
  const [isBrandCustomizationOpen, setIsBrandCustomizationOpen] =
    useState(false)
  const [selectedSellingPlatform, setSelectedSellingPlatform] =
    useState('shopify')
  const [isShipFromSelectOpen, setIsShipFromSelectOpen] = useState(false)

  // Ship From 选项
  const shipFromOptions = [
    { label: 'China', value: 'shopify' },
    { label: 'USA', value: 'woocommerce' },
    { label: 'EU', value: 'ebay' },
  ]
  const [isShipToSelectOpen, setIsShipToSelectOpen] = useState(false)
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<string>('')
  const [isShippingMethodOpen, setIsShippingMethodOpen] = useState(false)
  const [isShippingOptionsDialogOpen, setIsShippingOptionsDialogOpen] =
    useState(false)
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    string | null
  >(null)
  const [isLoadingFreight, setIsLoadingFreight] = useState(false)

  // 物流方式选项数据（从API获取，初始为空数组）
  const [shippingMethodOptions, setShippingMethodOptions] = useState<
    Array<{
      id: string
      title: string
      cost: string
      deliveryTime: string
    }>
  >([])

  const selectedShippingMethodData = shippingMethodOptions.find(
    (method) => method.id === selectedShippingMethod
  )

  const [selectedBuyType, setSelectedBuyType] = useState<'sample' | 'stock'>(
    'sample'
  )
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [purchaseMode, setPurchaseMode] = useState<'sample' | 'stock'>('sample')
  const [viewMode, setViewMode] = useState<'details' | 'confirm'>('details')
  const [confirmOrderPayload, setConfirmOrderPayload] =
    useState<ConfirmOrderPayload | null>(null)

  const selectedCountry = countryOptions.find((c) => c.value === selectedTo)

  console.log('countryOptions:', countryOptions)
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
  const [, setSkuRecords] = useState<SkuRecordItem[]>([])
  const [, setIsLoadingSku] = useState(false)

 
  // 获取 SKU 记录
  useEffect(() => {
    const fetchSkuRecords = async () => {
      if (!productId) return

      const customerId = auth.user?.customerId

      setIsLoadingSku(true)
      try {
        const records = await querySkuByCustomer(
          productId,
          customerId ? Number(customerId) : 0,
          '0',
          1,
          100
        )
        // 处理返回类型：可能是数组或对象
        const skuRecords = Array.isArray(records) ? records : records.rows
        setSkuRecords(skuRecords)
        console.log('SKU 记录:', skuRecords)
      } catch (error) {
        console.error('Failed to fetch SKU records:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load SKU records. Please try again.'
        )
        setSkuRecords([])
      } finally {
        setIsLoadingSku(false)
      }
    }

    void fetchSkuRecords()
  }, [productId])

  // 复制SPU功能
  const handleCopySPU = () => {
    if (productData) {
      navigator.clipboard.writeText(productData.sku)
    }
  }

  // 检查是否所有规格都已选择
  const areAllSpecsSelected = () => {
    if (!apiProduct) return true // 如果没有产品数据，认为已选择（向后兼容）

    const skuSpecs = Array.isArray(
      (apiProduct as Record<string, unknown>)?.hzkj_sku_spec_e
    )
      ? ((apiProduct as Record<string, unknown>)
          .hzkj_sku_spec_e as Array<{
          hzkj_sku_spec_id?: string
          [key: string]: unknown
        }>)
      : []

    // 如果没有规格，认为已选择
    if (skuSpecs.length === 0) return true

    // 检查是否所有规格都已选择
    return skuSpecs.every(
      (spec) =>
        spec.hzkj_sku_spec_id &&
        selectedSpecs[spec.hzkj_sku_spec_id] !== undefined &&
        selectedSpecs[spec.hzkj_sku_spec_id] !== ''
    )
  }

  const handleBuySampleButtonClick = () => {
    console.log('handleBuySampleButtonClick called')

    // 检查是否所有规格都已选择
    if (!areAllSpecsSelected()) {
      toast.error('Please select attribute values')
      return
    }

    setSelectedBuyType('sample')
    setPurchaseMode('sample')
    setIsPurchaseDialogOpen(true)
    console.log('isPurchaseDialogOpen set to true')
  }

  const handleBuyStockButtonClick = () => {
    console.log('handleBuyStockButtonClick called')

    // 检查是否所有规格都已选择
    if (!areAllSpecsSelected()) {
      toast.error('Please select attribute values')
      return
    }

    setSelectedBuyType('stock')
    setPurchaseMode('stock')
    setIsPurchaseDialogOpen(true)
    console.log('isPurchaseDialogOpen set to true')
  }

  // 处理收藏产品
  const handleCollect = async () => {
    if (!productId) {
      toast.error('Product ID is missing')
      return
    }

    const customerId = auth.user?.customerId || auth.user?.id
    if (!customerId) {
      toast.error('Customer ID is missing')
      return
    }

    setIsCollecting(true)
    try {
      await collectProduct(String(productId), String(customerId))
      toast.success('Product collected successfully')
      setIsCollectDialogOpen(false)
    } catch (error) {
      console.error('Failed to collect product:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to collect product. Please try again.'
      )
    } finally {
      setIsCollecting(false)
    }
  }

  // 处理确认订单回调
  const handleConfirmOrder = (payload: ConfirmOrderPayload) => {
    setConfirmOrderPayload(payload)
    setIsPurchaseDialogOpen(false)
    setViewMode('confirm')
  }

  // 返回产品详情视图
  const handleBackToDetails = () => {
    setViewMode('details')
    setConfirmOrderPayload(null)
  }

  // 当发布弹框打开时，获取店铺列表
  useEffect(() => {
    const fetchStores = async () => {
      if (!isPublishDialogOpen) return

      const userId = auth.user?.id
      if (!userId) {
        setIsLoadingStores(false)
        setStores([])
        return
      }

      setIsLoadingStores(true)
      try {
        const response = await getUserShop(userId)
        console.log('获取店铺 API 完整响应:', response)
        console.log('response.data:', response.data)

        // 根据实际 API 响应结构处理数据
        let shopsData: ShopInfo[] = []
        if (response.errorCode === '0' && response.data) {
          // response.data 是 unknown 类型，需要类型断言
          const data = response.data as { data?: unknown }
          console.log('response.data.data:', data.data)

          // 如果 response.data.data 是数组，直接使用
          if (Array.isArray(data.data)) {
            shopsData = data.data as ShopInfo[]
          }
          // 如果 response.data.data 是对象且有 list 属性
          else if (
            typeof data.data === 'object' &&
            data.data !== null &&
            'list' in data.data
          ) {
            const list = (data.data as { list?: unknown[] }).list
            shopsData = Array.isArray(list) ? (list as ShopInfo[]) : []
          }
          // 如果 response.data.data 是单个对象，包装成数组
          else if (typeof data.data === 'object' && data.data !== null) {
            shopsData = [data.data as ShopInfo]
          }
        }

        console.log('最终解析的店铺列表:', shopsData)

        // 将店铺数据转换为下拉框需要的格式
        const storeOptions = shopsData
          .filter((shop) => shop.id) // 过滤掉没有 id 的店铺
          .map((shop) => ({
            id: String(shop.id),
            name: shop.name || shop.platform || String(shop.id),
            value: String(shop.id),
          }))

        setStores(storeOptions)
      } catch (error) {
        console.error('获取店铺列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load shops. Please try again.'
        )
        setStores([])
      } finally {
        setIsLoadingStores(false)
      }
    }

    fetchStores()
  }, [isPublishDialogOpen, auth.user?.id])

  // 为 StoreListingTabs 准备 Variant Pricing 表格（必须在早期 return 之前）
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

  // 处理点击发布到店铺按钮：直接打开发布弹框（不再强制选择颜色和尺寸）
  const handlePublishToStoreClick = () => {
    // setIsPublishDialogOpen(true)
    setIsStoreListingOpen(true)
  }

  // 处理发布到店铺：关闭弹框并显示 StoreListingTabs 组件
  const handlePublishToStore = () => {
    if (!selectedStore) {
      alert('请选择一个店铺')
      return
    }

    if (!productData) {
      toast.error('Product data is not available')
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

  // 如果是确认订单视图，直接返回确认订单组件
  if (viewMode === 'confirm' && confirmOrderPayload) {
    return (
      <ConfirmOrderView
        orderData={confirmOrderPayload}
        onBack={handleBackToDetails}
      />
    )
  }

  // 早期返回必须在所有 Hooks 之后
  if (isLoadingProduct) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground'>Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold'>product not found</h2>
          <p className='text-muted-foreground mb-4'>
            Please check the product ID is correct
          </p>
          <Button onClick={() => navigate({ to: '/all-products' })}>
            Back to product list
          </Button>
        </div>
      </div>
    )
  }

  // 确保 productData 存在且名称是字符串
  if (!productData) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold'>
            product data not available
          </h2>
          <p className='text-muted-foreground mb-4'>Please try again later</p>
          <Button onClick={() => navigate({ to: '/all-products' })}>
            Back to product list
          </Button>
        </div>
      </div>
    )
  }

  const totalPrice = (productData.price ?? 0) * selectedQuantity


  console.log('apiProduct:', apiProduct)

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* 返回按钮 */}
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => navigate({ to: '/all-products' })}
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
                    {productData.image ? (
                      <img
                        src={productData.image}
                        alt={productData.name || 'Product'}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center bg-gray-100 text-gray-400'>
                        No Image
                      </div>
                    )}
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
                          {img && img.trim() !== '' ? (
                            <img
                              src={img}
                              alt={`${productData.name || 'Product'} ${index + 1}`}
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400'>
                              No Image
                            </div>
                          )}
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
                          SPU: {productData.sku}
                        </span>
                        

                        <button
                          onClick={handleCopySPU}
                          className='text-muted-foreground hover:text-foreground transition-colors'
                          title='Copy SPU'
                        >
                          <Copy className='h-4 w-4' />
                        </button>
                      </div>
                      <div>
                        {apiProduct &&
                          Array.isArray(
                            (apiProduct as Record<string, unknown>)
                              ?.hzkj_sku_spec_e
                          ) &&
                          Object.values(selectedSpecs).length > 0 && (
                            <div className='text-sm text-muted-foreground'>
                              select SKU: {Object.values(selectedSpecs).join(', ')}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* 价格和MOQ */}
                    <div className='flex items-center gap-4'>
                      <div className='text-3xl font-bold text-orange-500'>
                        ${(productData?.price ?? 0).toFixed(2)}
                      </div>
                      <div className='rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm'>
                        MOQ: 1
                      </div>
                    </div>

                    {apiProduct &&
                      Array.isArray(
                        (apiProduct as Record<string, unknown>)
                          ?.hzkj_sku_spec_e
                      ) &&
                      (
                        (apiProduct as Record<string, unknown>)
                          .hzkj_sku_spec_e as Array<{
                          hzkj_sku_spec_id?: string
                          hzkj_sku_spec_name?: string
                          hzkj_sku_specvalue_e?: Array<{
                            hzkj_sku_specvalue_id?: string
                            hzkj_sku_specvalue_name?: string
                            [key: string]: unknown
                          }>
                          [key: string]: unknown
                        }>
                      ).map((spec) => (
                        <div key={spec.hzkj_sku_spec_id || ''}>
                          <Label className='mb-2 block text-sm font-medium'>
                            {spec.hzkj_sku_spec_name || ''}
                          </Label>
                          <div className='flex flex-wrap gap-2'>
                            {Array.isArray(spec.hzkj_sku_specvalue_e) &&
                              spec.hzkj_sku_specvalue_e.map((value) => (
                                <Button
                                  key={value.hzkj_sku_specvalue_id || ''}
                                  variant={
                                    selectedSpecs[
                                      spec.hzkj_sku_spec_id || ''
                                    ] === value.hzkj_sku_specvalue_id
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size='sm'
                                  onClick={() =>
                                    setSelectedSpecs((prev) => ({
                                      ...prev,
                                      [spec.hzkj_sku_spec_id || '']:
                                        value.hzkj_sku_specvalue_id || '',
                                    }))
                                  }
                                >
                                  {value.hzkj_sku_specvalue_name || ''}
                                </Button>
                              ))}
                          </div>
                        </div>
                      ))}

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
                        {(() => {
                          const weight = apiProduct
                            ? (apiProduct as Record<string, unknown>)
                                .hzkj_pack_weight
                            : null

                          if (!weight) {
                            return (
                              <span className='text-sm text-gray-600'>
                                158g
                              </span>
                            )
                          }

                          const singleWeight =
                            typeof weight === 'number'
                              ? weight
                              : parseFloat(
                                  String(weight).replace(/[^0-9.]/g, '')
                                ) || 0

                          if (!singleWeight) {
                            return (
                              <span className='text-sm text-gray-600'>
                                158g
                              </span>
                            )
                          }

                          const totalWeight = singleWeight * selectedQuantity

                          return (
                            <span className='text-sm text-gray-600'>
                              {totalWeight}g
                            </span>
                          )
                        })()}
                      </div>
                    </div>

                    {!isFromPackagingProducts && (
                      <>
                        <div className='flex items-start gap-1.5 border-y py-3'>
                          <Popover
                            open={isShipFromSelectOpen}
                            onOpenChange={setIsShipFromSelectOpen}
                          >
                            <PopoverTrigger asChild>
                              <div
                                className='flex flex-1 cursor-pointer items-center gap-1.5'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setIsShipFromSelectOpen(true)
                                }}
                              >
                                <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200'>
                                  <Store className='h-3.5 w-3.5 text-gray-600' />
                                </div>
                                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                                  <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
                                    <span className='whitespace-nowrap'>
                                      ship from
                                    </span>
                                    <ChevronDown className='h-2.5 w-2.5 shrink-0' />
                                  </div>
                                  <div className='text-xs font-bold'>
                                    {shipFromOptions.find(
                                      (opt) =>
                                        opt.value === selectedSellingPlatform
                                    )?.label || 'Select...'}
                                  </div>
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-[200px] p-0'
                              align='start'
                            >
                              <Command>
                                <CommandInput placeholder='Search...' />
                                <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  <CommandGroup>
                                    {shipFromOptions.map((option) => (
                                      <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                          setSelectedSellingPlatform(
                                            option.value
                                          )
                                          setIsShipFromSelectOpen(false)
                                        }}
                                      >
                                        {option.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          <div className='h-8 w-px shrink-0 bg-gray-200' />

                          <Popover
                            open={isShipToSelectOpen}
                            onOpenChange={setIsShipToSelectOpen}
                          >
                            <PopoverTrigger asChild>
                              <div
                                className='flex flex-1 cursor-pointer items-center gap-1.5'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setIsShipToSelectOpen(true)
                                }}
                              >
                                <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200'>
                                  <Truck className='h-3.5 w-3.5 text-gray-600' />
                                </div>
                                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                                  <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
                                    <span className='whitespace-nowrap'>
                                      Ship To
                                    </span>
                                    <ChevronDown className='h-2.5 w-2.5 shrink-0' />
                                  </div>
                                  {isLoadingFreight ? (
                                    <div className='flex items-center gap-1.5'>
                                      <Loader2 className='h-3 w-3 animate-spin text-gray-500' />
                                      <span className='text-xs font-bold text-gray-500'>
                                        Loading...
                                      </span>
                                    </div>
                                  ) : selectedCountry ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className='flex max-w-[100px] min-w-0 items-center gap-1.5'>
                                          <span
                                            className={cn(
                                              selectedCountry.flagClass,
                                              'flex-shrink-0 shrink-0'
                                            )}
                                            aria-hidden='true'
                                          />
                                          <span className='min-w-0 flex-1 truncate text-xs font-bold'>
                                            {selectedCountry.label}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {selectedCountry.label}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span className='text-xs font-bold'>
                                      Select...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-[280px] p-0'
                              align='start'
                            >
                              <Command>
                                <CommandInput placeholder='Search country...' />
                                <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  <CommandGroup>
                                    {countryOptions.map((country) => (
                                      <CommandItem
                                        key={country.value}
                                        value={country.label}
                                        onSelect={async () => {
                                          setSelectedTo(country.value)
                                          setIsShipToSelectOpen(false)

                                          // 调用运费计算API
                                          if (productId) {
                                            await handleCountrySelectAndCalculateFreight(
                                              productId,
                                              country,
                                              statesData,
                                              setShippingMethodOptions,
                                              setSelectedDestinationId,
                                              setIsLoadingFreight
                                            )
                                          }
                                        }}
                                      >
                                        <div className='flex items-center gap-2'>
                                          <span
                                            className={cn(
                                              country.flagClass,
                                              'mr-1'
                                            )}
                                            aria-hidden='true'
                                          />
                                          <span>{country.label}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          <div className='h-8 w-px shrink-0 bg-gray-200' />

                          <Popover
                            open={
                              isShippingMethodOpen &&
                              !!(selectedDestinationId && selectedTo)
                            }
                            onOpenChange={(open) => {
                              // 只有在选择了国家的情况下才允许打开
                              if (
                                open &&
                                (!selectedDestinationId || !selectedTo)
                              ) {
                                toast.error('Please select a country first')
                                return
                              }
                              setIsShippingMethodOpen(open)
                            }}
                          >
                            <PopoverTrigger asChild>
                              <div
                                className='flex flex-1 cursor-pointer items-center gap-1.5'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // 检查是否选择了国家
                                  if (!selectedDestinationId || !selectedTo) {
                                    toast.error('Please select a country first')
                                    return
                                  }
                                  setIsShippingMethodOpen(true)
                                }}
                              >
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
                                    <span className='text-xs font-bold'>
                                      {selectedShippingMethodData?.title ||
                                        'Select...'}
                                    </span>
                                    <div className='flex shrink-0 items-center gap-0.5'>
                                      <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
                                      <span className='text-[10px] whitespace-nowrap text-green-600'>
                                        Available
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-[450px] p-0'
                              align='start'
                            >
                              <div className='p-4'>
                                <RadioGroup
                                  value={selectedShippingMethod}
                                  onValueChange={(value) => {
                                    setSelectedShippingMethod(value)
                                    setIsShippingMethodOpen(false)
                                  }}
                                >
                                  {/* 表头 */}
                                  <div className='mb-2 grid grid-cols-[24px_1fr_120px_100px] gap-4 border-b pb-2 text-sm font-medium text-gray-700'>
                                    <div />
                                    <div>Shipping Method</div>
                                    <div className='text-center'>
                                      Total Shipping Cost
                                    </div>
                                    <div className='text-right'>
                                      Delivery Time
                                    </div>
                                  </div>
                                  {isLoadingFreight ? (
                                    <div className='flex items-center justify-center py-8'>
                                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                      <span className='text-sm text-gray-500'>
                                        Loading shipping methods...
                                      </span>
                                    </div>
                                  ) : shippingMethodOptions.length > 0 ? (
                                    <div className='space-y-0'>
                                      {shippingMethodOptions.map((method) => (
                                        <label
                                          key={method.id}
                                          className='grid cursor-pointer grid-cols-[24px_1fr_120px_100px] items-center gap-4 border-b py-3 text-sm last:border-b-0 hover:bg-gray-50'
                                        >
                                          <RadioGroupItem
                                            value={method.id}
                                            className='ml-1'
                                          />
                                          <div className='font-medium'>
                                            {method.title}
                                          </div>
                                          <div className='text-center'>
                                            {method.cost}
                                          </div>
                                          <div className='text-right'>
                                            {method.deliveryTime}
                                          </div>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className='py-8 text-center'>
                                      No shipping methods available
                                    </div>
                                  )}
                                </RadioGroup>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

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
                            <span>
                              {selectedShippingMethodData?.deliveryTime ||
                                '---'}
                            </span>
                          </div>
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Shipping Fee:{' '}
                            </span>
                            <span className='font-semibold'>
                              {selectedShippingMethodData?.cost || '---'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* 右侧：价格和操作（在桌面端固定在视窗内） */}
        <div className='lg:col-span-1 lg:self-start'>
          <div className='lg:fixed lg:top-28 lg:right-8 lg:w-[300px]'>
            <Card>
              <CardHeader>
                <CardTitle>Recap</CardTitle>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* 变体信息 */}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Variation Name</span>
                  <span>
                    {(() => {
                      if (Object.keys(selectedSpecs).length === 0) {
                        return '--'
                      }

                      if (!apiProduct || !Array.isArray((apiProduct as Record<string, unknown>)?.hzkj_sku_spec_e)) {
                        return '--'
                      }

                      const specs = (apiProduct as Record<string, unknown>).hzkj_sku_spec_e as Array<{
                        hzkj_sku_spec_id?: string
                        hzkj_sku_specvalue_e?: Array<{
                          hzkj_sku_specvalue_id?: string
                          hzkj_sku_specvalue_name?: string
                          [key: string]: unknown
                        }>
                        [key: string]: unknown
                      }>

                      const selectedNames: string[] = []
                      
                      Object.entries(selectedSpecs).forEach(([specId, specValueId]) => {
                        const spec = specs.find((s) => s.hzkj_sku_spec_id === specId)
                        if (spec && Array.isArray(spec.hzkj_sku_specvalue_e)) {
                          const specValue = spec.hzkj_sku_specvalue_e.find(
                            (v) => v.hzkj_sku_specvalue_id === specValueId
                          )
                          if (specValue?.hzkj_sku_specvalue_name) {
                            selectedNames.push(specValue.hzkj_sku_specvalue_name)
                          }
                        }
                      })

                      return selectedNames.length > 0 ? selectedNames.join(', ') : '--'
                    })()}
                  </span>
                </div>

                {/* 价格信息 */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Product Price</span>
                    <span className='font-medium'>
                      ${(productData?.price ?? 0).toFixed(2)}
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
                    {!isFromPackagingProducts ? (
                      <Button
                        className='w-full'
                        size='lg'
                        onClick={handlePublishToStoreClick}
                      >
                        {/* 添加这个div来统一布局 */}
                        <div className='flex w-full items-center justify-start'>
                          <Store className='mr-2 h-4 w-4' />
                          <span>Publish To Store</span>
                        </div>
                      </Button>
                    ) : null}
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Publish To Store</DialogTitle>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='store-select'>Select Store</Label>
                          <Select
                            value={selectedStore}
                            onValueChange={setSelectedStore}
                            disabled={isLoadingStores}
                          >
                            <SelectTrigger id='store-select'>
                              <SelectValue
                                placeholder={
                                  isLoadingStores
                                    ? 'Loading shops...'
                                    : stores.length === 0
                                      ? 'No shops available'
                                      : 'Select Store to Publish'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {stores.length === 0 && !isLoadingStores ? (
                                <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                                  No shops available
                                </div>
                              ) : (
                                stores.map((store) => (
                                  <SelectItem
                                    key={store.id}
                                    value={store.value}
                                  >
                                    {store.name}
                                  </SelectItem>
                                ))
                              )}
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

                  {!isFromPackagingProducts ? (
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full',
                        selectedBuyType === 'sample' && 'bg-muted'
                      )}
                      size='lg'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Buy Sample button clicked')
                        handleBuySampleButtonClick()
                      }}
                    >
                      <div className='flex w-full items-center justify-start'>
                        <ShoppingCart className='mr-2 h-4 w-4' />
                        <span>Buy Sample</span>
                      </div>
                    </Button>
                  ) : null}
                  {shouldShowBuyStockInPackaging || !isFromPackagingProducts ? (
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full',
                        selectedBuyType === 'stock' && 'bg-muted'
                      )}
                      size='lg'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Buy Stock button clicked')
                        handleBuyStockButtonClick()
                      }}
                    >
                      <div className='flex w-full items-center justify-start'>
                        <Tag className='mr-2 h-4 w-4' />
                        <span>Buy Stock</span>
                      </div>
                    </Button>
                  ) : null}

                  {shouldShowMyPackagingButton && (
                    <>
                      <Button
                        variant='outline'
                        className='w-full'
                        size='lg'
                        onClick={() => setIsCollectDialogOpen(true)}
                        disabled={isCollecting}
                      >
                        <div className='flex w-full items-center justify-start'>
                          {isCollecting ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          ) : (
                            <Heart className='mr-2 h-4 w-4' />
                          )}
                          <span>
                            {shouldShowCollectionButton
                              ? 'Collection'
                              : 'My Packaging'}
                          </span>
                        </div>
                      </Button>
                      <ConfirmDialog
                        open={isCollectDialogOpen}
                        onOpenChange={(open) => {
                          if (!isCollecting) {
                            setIsCollectDialogOpen(open)
                          }
                        }}
                        title='sure to collect this product?'
                        desc='Are you sure you want to collect this product?'
                        handleConfirm={handleCollect}
                        isLoading={isCollecting}
                        confirmText={
                          isCollecting ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              handling...
                            </>
                          ) : (
                            'confirm'
                          )
                        }
                      />
                    </>
                  )}

                  {isFromPackagingProducts && (
                    <Button
                      variant='outline'
                      className='w-full'
                      size='lg'
                      onClick={() => {
                        navigate({ to: `/products/${productData.id}/design` })
                      }}
                    >
                      <div className='flex w-full items-center justify-start'>
                        <Palette className='mr-2 h-4 w-4' />
                        <span>Design</span>
                      </div>
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
          <CardTitle>Product Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='prose max-w-none'>
            {richTextContent ? (
              <div
                className='text-muted-foreground leading-relaxed'
                dangerouslySetInnerHTML={{ __html: richTextContent }}
              />
            ) : (
              <>
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
              </>
            )}
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
          price: productData?.price ?? 0,
          shippingFrom: 'beijing',
          shippingMethod: 'ds-economy-uk',
          shippingCost: 3.07,
          totalAmount: (productData?.price ?? 0) + 3.07,
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
        defaultTo={selectedTo || 'FR'}
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
            There is already a shipping address, which will be used to place an
            order for samples.
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
            There is already a shipping warehouse, which will be used to prepare
            inventory.
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
            There is already a shipping address, which will be used to place an
            order for samples.
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

      <ProductPurchaseDialog
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
        productId={productId}
        mode={purchaseMode}
        onConfirmOrder={handleConfirmOrder}
        apiProduct={apiProduct}
        initialSelectedSpecs={selectedSpecs}
      />
    </div>
  )
}
