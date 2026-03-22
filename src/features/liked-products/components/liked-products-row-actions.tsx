import { useMemo, useRef, useState } from 'react'
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  useReactTable,
} from '@tanstack/react-table'
import { type Row } from '@tanstack/react-table'
import { Loader2, Store, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  delCollectProducts,
  delRecommendProducts,
  getProduct,
  type ApiProductItem,
} from '@/lib/api/products'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  StoreListingTabs,
  type StoreListingTabsHandle,
} from '@/features/store-management/components/store-listing-tabs'
import { createVariantPricingColumns } from '@/features/store-management/components/variant-pricing-columns'
import { mockVariantPricingData } from '@/features/store-management/components/variant-pricing-data'
import { type VariantPricing } from '@/features/store-management/components/variant-pricing-schema'
import { type LikedProduct } from '../data/schema'

type LikedProductsRowActionsProps = {
  row: Row<LikedProduct>
  onDeleteSuccess?: () => void
  /** 为 true 时使用 delCollectProducts（/collection-products），否则使用 delRecommendProducts */
  useDelCollectApi?: boolean
}

export function LikedProductsRowActions({
  row,
  onDeleteSuccess,
  useDelCollectApi = false,
}: LikedProductsRowActionsProps) {
  const product = row.original
  const { auth } = useAuthStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStoreListingOpen, setIsStoreListingOpen] = useState(false)
  const [isLoadingPublishData, setIsLoadingPublishData] = useState(false)
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false)
  const [apiProduct, setApiProduct] = useState<ApiProductItem | null>(null)
  const [richTextContent, setRichTextContent] = useState('')
  const [storeListingSelectedTags, setStoreListingSelectedTags] = useState<
    string[]
  >([])
  const [storeListingRowSelection, setStoreListingRowSelection] =
    useState<RowSelectionState>({})
  const [storeListingSorting, setStoreListingSorting] = useState<SortingState>([])
  const [storeListingColumnFilters, setStoreListingColumnFilters] =
    useState<ColumnFiltersState>([])
  const storeListingTabsRef = useRef<StoreListingTabsHandle>(null)
  const stopEventPropagation = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
  }
  const variantPricingColumns = useMemo(() => createVariantPricingColumns(), [])
  const variantPricingData = useMemo(() => mockVariantPricingData, [])
  const variantPricingTable: TanstackTable<VariantPricing> = useReactTable<VariantPricing>(
    {
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
    }
  )

  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='h-7 px-2 text-xs'
          onMouseDown={stopEventPropagation}
          onPointerDown={stopEventPropagation}
          onClick={async (e) => {
            e.stopPropagation()
            const customerId = auth.user?.customerId || auth.user?.id
            if (!customerId) {
              toast.error('Customer ID not found')
              return
            }
            setIsLoadingPublishData(true)
            try {
              const detail = await getProduct(product.id, String(customerId))
              setApiProduct(detail)
              const richtext = (detail as Record<string, unknown> | null)?.hzkj_richtextfield
              setRichTextContent(typeof richtext === 'string' ? richtext : '')
              setIsStoreListingOpen(true)
            } catch (error) {
              console.error('Failed to load product detail for publish:', error)
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to load product detail.'
              )
            } finally {
              setIsLoadingPublishData(false)
            }
          }}
          disabled={isLoadingPublishData}
        >
          {isLoadingPublishData ? (
            <>
              <Loader2 className='mr-1 h-3.5 w-3.5 animate-spin' />
              Loading...
            </>
          ) : (
            <>
              <Store className='mr-1 h-3.5 w-3.5' />
              Publish
            </>
          )}
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-7 border-gray-200 px-2 text-xs text-gray-500'
          disabled={isDeleting}
          onMouseDown={stopEventPropagation}
          onPointerDown={stopEventPropagation}
          onClick={async (e) => {
            e.stopPropagation()

            const customerId = auth.user?.customerId

            if (!customerId) {
              toast.error('Customer ID is required')
              return
            }

            try {
              setIsDeleting(true)
              if (useDelCollectApi) {
                await delCollectProducts({
                  customerId: String(customerId),
                  productIds: [product.id],
                })
              } else {
                await delRecommendProducts({
                  customerId: String(customerId),
                  productIds: [product.id],
                })
              }

              toast.success('Product removed from collection successfully.')
              onDeleteSuccess?.()
            } catch (error) {
              console.error('删除收藏商品失败:', error)
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to delete collection product. Please try again.'
              )
            } finally {
              setIsDeleting(false)
            }
          }}
        >
          <Trash2 className='mr-1 h-3.5 w-3.5' />
        </Button>
      </div>

      <Sheet open={isStoreListingOpen} onOpenChange={setIsStoreListingOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-full flex-col sm:!w-[70vw] sm:!max-w-none'
          onClick={stopEventPropagation}
          onMouseDown={stopEventPropagation}
        >
          <div className='flex h-full text-sm'>
            <StoreListingTabs
              ref={storeListingTabsRef}
              selectedTags={storeListingSelectedTags}
              setSelectedTags={setStoreListingSelectedTags}
              variantPricingTable={variantPricingTable}
              columns={variantPricingColumns}
              productTitle={product.name}
              productId={product.id}
              apiProduct={apiProduct}
              richTextContent={richTextContent}
              onConfirm={() => setIsStoreListingOpen(false)}
            />
          </div>
          <div className='flex items-center justify-end gap-2 border-t px-4 py-3'>
            <Button
              variant='outline'
              onClick={() => setIsStoreListingOpen(false)}
              className='min-w-[96px]'
            >
              Cancel
            </Button>
            <Button
              className='min-w-[120px]'
              disabled={isConfirmingPublish}
              onClick={async () => {
                if (!storeListingTabsRef.current) return
                setIsConfirmingPublish(true)
                try {
                  await storeListingTabsRef.current.handleConfirm()
                } catch (error) {
                  console.error('Failed to push product:', error)
                } finally {
                  setIsConfirmingPublish(false)
                }
              }}
            >
              {isConfirmingPublish ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Publishing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
