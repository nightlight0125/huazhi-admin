import { useEffect, useState } from 'react'
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import type { ShopInfo } from '@/stores/shop-store'
import { getUserShop } from '@/lib/api/shop'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { DataTableToolbar } from '@/components/data-table'
import { RichTextEditor } from '@/components/rich-text-editor'
import { VariantPricingBulkActions } from './variant-pricing-bulk-actions'
import { type VariantPricing } from './variant-pricing-schema'

// 模拟标签选项（只用于右侧表单）
const tagOptions = [
  { id: 'tag1', name: 'Electronics' },
  { id: 'tag2', name: 'Fashion' },
  { id: 'tag3', name: 'Home & Garden' },
  { id: 'tag4', name: 'Sports' },
  { id: 'tag5', name: 'Toys' },
  { id: 'tag6', name: 'Beauty' },
] as const

type StoreListingTabsProps = {
  tagsPopoverOpen: boolean
  setTagsPopoverOpen: (open: boolean) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  variantPricingTable: TanstackTable<VariantPricing>
  columns: any[]
}

export function StoreListingTabs({
  tagsPopoverOpen,
  setTagsPopoverOpen,
  selectedTags,
  setSelectedTags,
  variantPricingTable,
  columns,
}: StoreListingTabsProps) {
  const [stores, setStores] = useState<
    Array<{ id: string; name: string; value: string }>
  >([])
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const [selectedStore, setSelectedStore] = useState('')
  const { auth } = useAuthStore()

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
                placeholder='Fashion Ozzy Christmas Elf Doll Xmas Trees Decoration Ornaments Music Godfather Classic Sitting Posture Noel Elf Plush Toys'
                className='h-8'
              />
            </div>

            <div className='space-y-1'>
              <div className='text-muted-foreground font-medium'>Tags</div>
              <Popover open={tagsPopoverOpen} onOpenChange={setTagsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-8 w-full justify-between font-normal'
                  >
                    {selectedTags.length > 0
                      ? `${selectedTags.length} tag(s) selected`
                      : 'Please add new'}
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-[--radix-popover-trigger-width] p-0'
                  align='start'
                >
                  <div className='max-h-[300px] overflow-y-auto p-1'>
                    {tagOptions.map((tag) => (
                      <div
                        key={tag.id}
                        className='hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5'
                      >
                        <Checkbox
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedTags([...selectedTags, tag.id])
                            } else {
                              setSelectedTags(
                                selectedTags.filter((id) => id !== tag.id)
                              )
                            }
                          }}
                        />
                        <label className='flex-1 cursor-pointer text-sm font-normal'>
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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
              <div className='mt-1.5 grid gap-2 md:grid-cols-3'>
                <div className='space-y-1'>
                  <div className='text-muted-foreground text-xs'>
                    * Shipping From
                  </div>
                  <Select defaultValue='china'>
                    <SelectTrigger className='h-7 text-xs'>
                      <SelectValue placeholder='Select' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='china'>China</SelectItem>
                      <SelectItem value='usa'>USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1'>
                  <div className='text-muted-foreground text-xs'>
                    Ship My Order(s) Most to
                  </div>
                  <Select defaultValue='anywhere'>
                    <SelectTrigger className='h-7 text-xs'>
                      <SelectValue placeholder='Select' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='anywhere'>
                        Ship from anywhere
                      </SelectItem>
                      <SelectItem value='usa'>USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1'>
                  <div className='text-muted-foreground text-xs'>
                    Shipping Method
                  </div>
                  <Select>
                    <SelectTrigger className='h-7 text-xs'>
                      <SelectValue placeholder='Select shipping method' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='default'>Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='text-muted-foreground mt-1.5 grid gap-2 text-xs md:grid-cols-3'>
                <div>Estimated Delivery Time: --</div>
                <div>Shipping Cost: --</div>
                <div>Tracking Information: --</div>
              </div>
            </div>

            {/* Variant pricing table */}
            <div className='space-y-1.5'>
              <div className='text-xs font-semibold'>Variant Pricing</div>

              <div className='space-y-1.5'>
                <DataTableToolbar
                  table={variantPricingTable}
                  showSearch={false}
                  filters={[]}
                  bulkRevise={{
                    enabled: true,
                    placeholder: 'Bulk Reviser',
                    options: [
                      {
                        label: 'Price Change',
                        value: 'price-change',
                      },
                      {
                        label: 'Shipping Fee',
                        value: 'shipping-fee',
                      },
                    ],
                    onApply: (type, value) => {
                      const selectedRows =
                        variantPricingTable.getFilteredSelectedRowModel().rows
                      console.log('Bulk revise:', type, value, selectedRows)
                      // TODO: 实现批量修改逻辑
                    },
                  }}
                />

                {/* Table */}
                <div className='border-border overflow-x-auto rounded-lg border'>
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
                      {variantPricingTable.getRowModel().rows?.length ? (
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
                            colSpan={columns.length}
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
            <RichTextEditor key='description-editor' initialContent={``} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
