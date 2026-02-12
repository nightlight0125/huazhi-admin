import { RichTextEditor } from '@/components/rich-text-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  calcuFreight,
  getStatesList,
  queryCountry,
  type CountryItem,
  type FreightOption,
  type StateItem,
} from '@/lib/api/logistics'
import {
  type ApiProductItem
} from '@/lib/api/products'
import { cn } from '@/lib/utils'
import { getUserShopOptions } from '@/lib/utils/shop-utils'
import { useAuthStore } from '@/stores/auth-store'
import {
  flexRender,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import { ChevronDown, Loader2, Store, Truck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { VariantPricingBulkActions } from './variant-pricing-bulk-actions'
import { type VariantPricing } from './variant-pricing-schema'

// 国家选项类型
interface CountryOption {
  value: string
  label: string
  flagClass: string
  id?: string
}

// 将国家数据转换为选项格式
function mapCountriesToCountryOptions(countriesData: CountryItem[]): CountryOption[] {
  return countriesData.map((country) => {
    const countryCode = country.twocountrycode || country.hzkj_code
    const code = countryCode?.toLowerCase() || ''
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
  productId: string | undefined,
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
    const countryId =
      country.id ||
      statesData.find(
        (s) => s.hzkj_code?.toUpperCase() === country.value.toUpperCase()
      )?.id
    if (!countryId) {
      toast.error('Failed to get country ID. Please try again.')
      return
    }

    const freightOptions = await calcuFreight({
      spuId: productId,
      destinationId: countryId,
    })

    const formattedOptions = freightOptions.map((option: FreightOption) => ({
      id: option.logsId || String(Math.random()),
      title: option.logsNumber || '',
      cost: `$${option.freight?.toFixed(2) || '0.00'}`,
      deliveryTime: option.time || '',
    }))

    setShippingMethodOptions(formattedOptions)
    setSelectedDestinationId(countryId)
  } catch (error) {
    console.error('Failed to calculate freight:', error)
    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to calculate freight. Please try again.'
    )
    setShippingMethodOptions([])
  } finally {
    setIsLoadingFreight(false)
  }
}

type StoreListingTabsProps = {
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  variantPricingTable: TanstackTable<VariantPricing>
  // 可选：保留 columns 以兼容现有调用处（当前组件内部未使用）
  columns?: any[]
  // 产品标题，用于填充 Title 输入框的默认值
  productTitle?: string
  // 产品ID，用于计算运费
  productId?: string
  // 产品数据，用于获取规格信息和图片
  apiProduct?: ApiProductItem | null
  // 规格信息
  specInfo?: Array<{
    specId: string
    specName: string
    specNumber?: string
  }>
  // 从详情页面传递的 shipping 状态
  selectedSellingPlatform?: string
  selectedTo?: string
  selectedShippingMethod?: string
  selectedDestinationId?: string | null
  shippingMethodOptions?: Array<{
    id: string
    title: string
    cost: string
    deliveryTime: string
  }>
  // 是否正在加载 variant pricing 数据
  isLoadingVariantPricing?: boolean
  // 富文本内容，用于初始化 Description 编辑器
  richTextContent?: string
}

export function StoreListingTabs({
  selectedTags,
  setSelectedTags,
  variantPricingTable,
  columns,
  productTitle = '',
  productId,
  apiProduct: _apiProduct,
  specInfo: _specInfo = [],
  selectedSellingPlatform: initialSelectedSellingPlatform,
  selectedTo: initialSelectedTo,
  selectedShippingMethod: initialSelectedShippingMethod,
  selectedDestinationId: initialSelectedDestinationId,
  shippingMethodOptions: initialShippingMethodOptions = [],
  isLoadingVariantPricing = false,
  richTextContent = '',
}: StoreListingTabsProps) {
  // 为了兼容现有调用处，这里接收 columns 但当前不使用
  void columns

  // 调试：检查 richTextContent 是否正确传递
  useEffect(() => {
    if (richTextContent) {
      console.log('RichTextContent received in StoreListingTabs:', richTextContent.substring(0, 100))
    }
  }, [richTextContent])
  const [stores, setStores] = useState<
    Array<{ id: string; name: string; value: string }>
  >([])
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const [selectedStore, setSelectedStore] = useState('')
  const [title, setTitle] = useState(productTitle)
  const [tagInput, setTagInput] = useState('')
  const [bulkReviseType, setBulkReviseType] = useState('price-change')
  const [bulkReviseValue, setBulkReviseValue] = useState('')
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const { auth } = useAuthStore()

  // Shipping 相关状态
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
  const [statesData, setStatesData] = useState<StateItem[]>([])
  const [selectedSellingPlatform, setSelectedSellingPlatform] = useState(
    initialSelectedSellingPlatform || 'shopify'
  )
  const [isShipFromSelectOpen, setIsShipFromSelectOpen] = useState(false)
  const [selectedTo, setSelectedTo] = useState(initialSelectedTo || '')
  const [isShipToSelectOpen, setIsShipToSelectOpen] = useState(false)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(
    initialSelectedShippingMethod || ''
  )
  const [isShippingMethodOpen, setIsShippingMethodOpen] = useState(false)
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    string | null
  >(initialSelectedDestinationId || null)
  const [isLoadingFreight, setIsLoadingFreight] = useState(false)
  const [shippingMethodOptions, setShippingMethodOptions] = useState<
    Array<{
      id: string
      title: string
      cost: string
      deliveryTime: string
    }>
  >(initialShippingMethodOptions)

  const shipFromOptions = [
    { label: 'China', value: 'shopify' },
    { label: 'USA', value: 'woocommerce' },
    { label: 'EU', value: 'ebay' },
  ]

  const selectedShippingMethodData = shippingMethodOptions.find(
    (method) => method.id === selectedShippingMethod
  )

  const selectedCountry = countryOptions.find((c) => c.value === selectedTo)

  // 当 productTitle prop 变化时，更新 title state
  useEffect(() => {
    setTitle(productTitle)
  }, [productTitle])

  // 加载国家列表
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await queryCountry(1, 1000)
        const countryOptionsData = mapCountriesToCountryOptions(countriesData)
        setCountryOptions(countryOptionsData)
        const states = await getStatesList(1, 1000)
        setStatesData(states)
      } catch (error) {
        setCountryOptions([])
      }
    }

    void loadCountries()
  }, [])

  // 当从 props 传递的数据变化时，更新本地状态
  useEffect(() => {
    if (initialSelectedSellingPlatform) {
      setSelectedSellingPlatform(initialSelectedSellingPlatform)
    }
  }, [initialSelectedSellingPlatform])

  useEffect(() => {
    if (initialSelectedTo) {
      setSelectedTo(initialSelectedTo)
    }
  }, [initialSelectedTo])

  useEffect(() => {
    if (initialSelectedShippingMethod) {
      setSelectedShippingMethod(initialSelectedShippingMethod)
    }
  }, [initialSelectedShippingMethod])

  useEffect(() => {
    if (initialSelectedDestinationId) {
      setSelectedDestinationId(initialSelectedDestinationId)
    }
  }, [initialSelectedDestinationId])

  useEffect(() => {
    if (initialShippingMethodOptions.length > 0) {
      setShippingMethodOptions(initialShippingMethodOptions)
    }
  }, [initialShippingMethodOptions])

  // 处理添加 tag
  const handleAddTag = (tagText: string) => {
    const trimmedTag = tagText.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag])
      setTagInput('')
    }
  }

  // 处理删除 tag
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  // 处理输入框按键事件
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (tagInput.trim()) {
        handleAddTag(tagInput)
      }
    }
  }

  // 处理输入框失焦事件
  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      handleAddTag(tagInput)
    }
  }

  // 批量修改处理函数
  const handleBulkRevise = () => {
    if (!bulkReviseValue.trim()) {
      toast.error('Please enter a value')
      return
    }

    const selectedRows =
      variantPricingTable.getFilteredSelectedRowModel().rows

    if (selectedRows.length === 0) {
      toast.error('Please select at least one row')
      return
    }

    // 保存值用于提示（在清空之前）
    const valueToShow = bulkReviseValue
    const typeLabel = bulkReviseType === 'price-change' ? 'price' : 'shipping fee'

    // 保存当前选择状态
    const currentSelection = variantPricingTable.getState().rowSelection

    // 批量更新选中行的数据
    selectedRows.forEach((row) => {
      const variant = row.original as VariantPricing
      if (bulkReviseType === 'price-change') {
        variant.yourPrice = bulkReviseValue
      } else if (bulkReviseType === 'shipping-fee') {
        variant.shippingFee = bulkReviseValue
      }
    })

    // 通过临时修改 rowSelection 来触发表格重新渲染
    // 先清空选择
    variantPricingTable.resetRowSelection()
    // 然后立即恢复选择（使用 setTimeout 确保在下一个渲染周期）
    setTimeout(() => {
      variantPricingTable.setRowSelection(currentSelection)
    }, 0)

    // 强制表格重新渲染
    setUpdateTrigger((prev) => prev + 1)

    // 清空输入框
    setBulkReviseValue('')
    
    // 显示成功提示
    toast.success(
      `Updated ${selectedRows.length} row(s) with ${typeLabel}: ${valueToShow}`
    )

    // 清空选择（可选）
    // variantPricingTable.resetRowSelection()
  }

  // 获取店铺列表
  useEffect(() => {
    const fetchStores = async () => {
      const userId = auth.user?.id
      if (!userId) {
        setIsLoadingStores(false)
        setStores([])
        return
      }

      setIsLoadingStores(true)
      try {
        const shopOptions = await getUserShopOptions(userId)

        // 将店铺选项转换为下拉框需要的格式
        const storeOptions = shopOptions.map((shop) => ({
          id: shop.value,
          name: shop.label,
          value: shop.value,
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
  }, [auth.user?.id])

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <Tabs
        defaultValue='products'
        className='flex flex-1 flex-col overflow-hidden'
      >
        {/* 顶部 Tabs 和提示条 */}
        <div className='shrink-0 border-b px-6 pt-3 pb-2'>
          <TabsList className='mb-2 h-8 rounded-none border-b bg-transparent p-0'>
            <TabsTrigger
              value='products'
              className='rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 text-sm shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none'
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value='variant-pricing'
              className='rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 text-sm shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none'
            >
              Variant Pricing
            </TabsTrigger>
            <TabsTrigger
              value='images'
              className='rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 text-sm shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none'
            >
              Images &amp; Videos
            </TabsTrigger>
            <TabsTrigger
              value='description'
              className='rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 text-sm shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none'
            >
              Description
            </TabsTrigger>
          </TabsList>
          <div className='bg-primary/5 border-primary/20 text-foreground rounded-md border px-3 py-2 text-sm'>
            Product data is provided directly by suppliers. Although CJ is
            committed to protecting intellectual property rights, it cannot
            ensure that all potential intellectual property disputes are
            avoided.
          </div>
        </div>

        {/* Tabs 内容 */}
        <TabsContent
          value='products'
          className='flex-1 overflow-y-auto px-6 py-4 text-sm'
        >
          <div className='space-y-4'>
            <div className='space-y-1'>
              <div className='text-muted-foreground font-medium'>
                * Store Selection
              </div>
              <Select
                value={selectedStore}
                onValueChange={setSelectedStore}
                disabled={isLoadingStores}
              >
                <SelectTrigger className='h-8'>
                  <SelectValue
                    placeholder={
                      isLoadingStores
                        ? 'Loading shops...'
                        : stores.length === 0
                          ? 'No shops available'
                          : 'Select Store'
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
                      <SelectItem key={store.id} value={store.value}>
                        {store.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <div className='text-muted-foreground font-medium'>* Title</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Fashion Ozzy Christmas Elf Doll Xmas Trees Decoration Ornaments Music Godfather Classic Sitting Posture Noel Elf Plush Toys'
                className='h-8'
              />
            </div>

            <div className='space-y-1'>
              <div className='text-muted-foreground font-medium'>Tags</div>
              <div className='space-y-2'>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={handleTagInputBlur}
                  placeholder='Enter tags (press Enter or comma to add)'
                  className='h-8'
                />
                {selectedTags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='outline'
                        className='flex items-center gap-1 pr-1'
                      >
                        <span>{tag}</span>
                        <button
                          type='button'
                          onClick={() => handleRemoveTag(tag)}
                          className='ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                          aria-label={`Remove ${tag} tag`}
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value='variant-pricing'
          className='flex-1 overflow-y-auto px-4 py-3 text-xs'
        >
          <div className='space-y-3'>
            <div className='border-border bg-muted/30 space-y-1.5 rounded-lg border px-3 py-2'>
              <div className='text-xs font-semibold'>
                Set a Default Shipping Method on CJ
              </div>
              <div className='mt-1.5 flex items-start gap-1.5'>
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
                          <span className='whitespace-nowrap'>ship from</span>
                          <ChevronDown className='h-2.5 w-2.5 shrink-0' />
                        </div>
                        <div className='text-xs font-bold'>
                          {shipFromOptions.find(
                            (opt) => opt.value === selectedSellingPlatform
                          )?.label || 'Select...'}
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className='w-[200px] p-0' align='start'>
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
                                setSelectedSellingPlatform(option.value)
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
                          <span className='whitespace-nowrap'>Ship To</span>
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
                          <span className='text-xs font-bold'>Select...</span>
                        )}
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className='w-[280px] p-0' align='start'>
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
                                  className={cn(country.flagClass, 'mr-1')}
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
                            {selectedShippingMethodData?.title || 'Select...'}
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
                  <PopoverContent className='w-[450px] p-0' align='start'>
                    <div className='p-4'>
                      <RadioGroup
                        value={selectedShippingMethod}
                        onValueChange={(value) => {
                          setSelectedShippingMethod(value)
                          setIsShippingMethodOpen(false)
                        }}
                      >
                        <div className='mb-2 grid grid-cols-[24px_1fr_120px_100px] gap-4 border-b pb-2 text-sm font-medium text-gray-700'>
                          <div />
                          <div>Shipping Method</div>
                          <div className='text-center'>
                            Total Shipping Cost
                          </div>
                          <div className='text-right'>Delivery Time</div>
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
                                <div className='font-medium'>{method.title}</div>
                                <div className='text-center'>{method.cost}</div>
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
              <div className='text-muted-foreground mt-1.5 space-y-2 border-t pt-2 text-xs'>
                <div>
                  <span>Estimated Processing Time: </span>
                  <span>1-3 days for 80% orders</span>
                </div>
                <div>
                  <span>Estimated Shipping Time: </span>
                  <span>
                    {selectedShippingMethodData?.deliveryTime || '---'}
                  </span>
                </div>
                <div>
                  <span>Shipping Fee: </span>
                  <span className='font-semibold'>
                    {selectedShippingMethodData?.cost || '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Variant pricing table */}
            <div className='space-y-1.5' style={{ marginTop: '30px' }}>
              {/* <div className='text-xs font-semibold'>Variant Pricing</div> */}

              <div className='space-y-1.5'>
                {/* Bulk Revise */}
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-medium'>Bulk Revise</span>
                  <div className='flex items-center'>
                    <Select
                      value={bulkReviseType}
                      onValueChange={setBulkReviseType}
                    >
                      <SelectTrigger className='h-8 w-32 rounded-r-none border-r-0 text-xs'>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='price-change'>Price Change</SelectItem>
                        <SelectItem value='shipping-fee'>Shipping Fee</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder='Enter value'
                      value={bulkReviseValue}
                      onChange={(e) => setBulkReviseValue(e.target.value)}
                      className='h-8 w-32 rounded-l-none border-l-0 text-xs'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleBulkRevise()
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleBulkRevise}
                    className='h-8 bg-orange-600 text-white hover:bg-orange-700'
                    size='sm'
                  >
                    Confirm
                  </Button>
                </div>

                {/* Table */}
                <div className='border-border overflow-x-auto rounded-lg border' key={updateTrigger}>
                  <Table>
                    <TableHeader>
                      {variantPricingTable
                        .getHeaderGroups()
                        .map((headerGroup) => (
                          <TableRow
                            key={headerGroup.id}
                            className='text-muted-foreground bg-muted/50'
                          >
                            {headerGroup.headers.map((header) => (
                              <TableHead
                                key={header.id}
                                className='border-b px-1.5 py-1.5 text-left text-xs'
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                      {isLoadingVariantPricing ? (
                        <TableRow>
                          <TableCell
                            colSpan={
                              variantPricingTable.getAllColumns().length
                            }
                            className='h-24 text-center'
                          >
                            <div className='flex items-center justify-center gap-2'>
                              <Loader2 className='h-4 w-4 animate-spin' />
                              <span className='text-xs'>Loading variant pricing data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : variantPricingTable.getRowModel().rows?.length ? (
                        variantPricingTable.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className='even:bg-muted/30 hover:bg-muted/50 transition-colors'
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className='border-b px-1.5 py-1.5 text-xs'
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={
                              variantPricingTable.getAllColumns().length
                            }
                            className='h-24 text-center'
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <VariantPricingBulkActions table={variantPricingTable} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value='images'
          className='text-muted-foreground flex-1 overflow-y-auto px-6 py-4 text-sm'
        >
          <div className='space-y-4'>
            <div className='text-sm font-semibold'>Images</div>
            <div>
              It is your responsibility to ensure that the pictures you use in
              your listings do not violate any copyright laws. CJ does not
              assume liability for infringement claims related to that.
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-semibold'>Marketing Picture</div>
              <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className='border-border bg-muted/30 relative aspect-[4/5] overflow-hidden rounded-lg border transition-shadow hover:shadow-md'
                  >
                    {/* 选中角标 */}
                    <div className='bg-primary text-primary-foreground absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm'>
                      ✓
                    </div>
                    {/* 放大图标占位 */}
                    <div className='bg-background/80 text-foreground absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm backdrop-blur-sm'>
                      ⤢
                    </div>
                    {/* 图片占位 */}
                    <div className='from-muted to-muted/50 h-full w-full bg-gradient-to-br' />
                    {/* Cover Image 标签，仅第一张显示 */}
                    {idx === 0 && (
                      <div className='bg-background/80 text-foreground absolute inset-x-0 bottom-0 px-2 py-1 text-sm font-medium backdrop-blur-sm'>
                        Cover Image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-semibold'>Videos</div>
              <div>
                <span className='font-semibold'>Available</span> Only Shopify,
                Tiktok and Temu stores are currently supported for listing
                videos.
              </div>
              <div className='mt-3 flex flex-wrap gap-4'>
                <div className='border-border bg-muted/30 h-32 w-56 overflow-hidden rounded-lg border' />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value='description'
          className='text-muted-foreground flex-1 overflow-y-auto px-6 py-4 text-sm'
        >
          <div className='space-y-2'>
            <div className='text-muted-foreground font-medium'>Description</div>
            <RichTextEditor
              key={`description-editor-${productId || 'new'}`}
              initialContent={richTextContent}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
