import { useMemo, useState } from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TasksProvider } from '../tasks/components/tasks-provider'
import { StoreListingTabs } from './components/store-listing-tabs'
import { StoresTable } from './components/stores-table'
import { createVariantPricingColumns } from './components/variant-pricing-columns'
import { mockVariantPricingData } from './components/variant-pricing-data'
import { stores } from './data/stores'

const platformButtons = [
  {
    name: 'Shopify',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/shopify_1764749551392.png',
    color: 'text-green-600',
  },
  {
    name: 'WooCommerce',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/woocommerce_1764749594778.png',
    color: 'text-purple-600',
  },
  {
    name: 'eBay',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/ebay-copy_1764749627017.png',
    color: 'text-blue-600',
  },
  {
    name: 'Etsy',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/etsy_1764749608025.png',
    color: 'text-orange-600',
  },
  {
    name: 'TikTok',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/tiktoklogo_tiktok_1764749645734.png',
    color: 'text-orange-600',
  },
  {
    name: 'Offline Store',
    icon: 'https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/office_1764749661650.png',
    color: 'text-gray-600',
  },
  {
    name: 'Amazon',
    icon: '/src/assets/brand-icons/platform-amazon.png',
    color: 'text-orange-600',
  },
]

export function StoreManagement() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagsPopoverOpen, setTagsPopoverOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(() => createVariantPricingColumns(), [])
  const data = useMemo(() => mockVariantPricingData, [])

  const variantPricingTable = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <TasksProvider>
      <Header>
        <HeaderActions />
      </Header>

      <Main fluid>
        {/* Add Store Section */}
        <Card className='mb-6'>
          <CardContent className=''>
            <div className='text-sm font-medium'>Add Store</div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3 rounded-lg px-4 py-3'>
                {platformButtons.map((platform) => (
                  <button
                    key={platform.name}
                    type='button'
                    className='border-border bg-background hover:bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors'
                    onClick={() => setDrawerOpen(true)}
                  >
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className='h-4 w-4 object-contain'
                    />
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <StoresTable data={stores} />
        </div>

        {/* 右侧抽屉 */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side='right'
            className='flex h-full w-full flex-col sm:!w-[70vw] sm:!max-w-none'
          >
            {/* 左侧菜单 + 右侧内容 */}
            <div className='flex h-full text-sm'>
              {/* 左侧：Listing 类型菜单 */}
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

              {/* 右侧：Tabs + 表单内容（抽离为公共组件） */}
              <StoreListingTabs
                tagsPopoverOpen={tagsPopoverOpen}
                setTagsPopoverOpen={setTagsPopoverOpen}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                variantPricingTable={variantPricingTable}
                columns={columns}
              />
            </div>

            <div className='flex items-center justify-end gap-2 border-t px-4 py-3'>
              <Button
                variant='outline'
                onClick={() => setDrawerOpen(false)}
                className='min-w-[96px]'
              >
                Cancel
              </Button>
              <Button className='min-w-[120px]'>Confirm</Button>
            </div>
          </SheetContent>
        </Sheet>
      </Main>
    </TasksProvider>
  )
}
