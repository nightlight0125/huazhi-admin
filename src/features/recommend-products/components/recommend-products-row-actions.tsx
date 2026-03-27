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
import { AlertTriangle, Loader2, Store, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { delRecommendProducts, getProduct, type ApiProductItem } from '@/lib/api/products'
import { TRASH_DELETE_ICON_CLASS } from '@/lib/delete-action-ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { StoreListingTabs } from '@/features/store-management/components/store-listing-tabs'
import { type StoreListingTabsHandle } from '@/features/store-management/components/store-listing-tabs'
import { createVariantPricingColumns } from '@/features/store-management/components/variant-pricing-columns'
import { mockVariantPricingData } from '@/features/store-management/components/variant-pricing-data'
import { type VariantPricing } from '@/features/store-management/components/variant-pricing-schema'
import { type RecommendProduct } from '../data/schema'

type RecommendProductsRowActionsProps = {
  row: Row<RecommendProduct>
  onDeleteSuccess?: () => void
}

export function RecommendProductsRowActions({
  row,
  onDeleteSuccess,
}: RecommendProductsRowActionsProps) {
  const product = row.original
  const { auth } = useAuthStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStoreListingOpen, setIsStoreListingOpen] = useState(false)
  const [isLoadingPublishData, setIsLoadingPublishData] = useState(false)
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false)
  const [apiProduct, setApiProduct] = useState<ApiProductItem | null>(null)
  const [richTextContent, setRichTextContent] = useState('')
  const storeListingTabsRef = useRef<StoreListingTabsHandle>(null)
  const [storeListingSelectedTags, setStoreListingSelectedTags] = useState<
    string[]
  >([])
  const [storeListingRowSelection, setStoreListingRowSelection] =
    useState<RowSelectionState>({})
  const [storeListingSorting, setStoreListingSorting] = useState<SortingState>([])
  const [storeListingColumnFilters, setStoreListingColumnFilters] =
    useState<ColumnFiltersState>([])
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Cannot delete: missing customer ID')
      return
    }

    if (!product.id) {
      toast.error('Cannot delete: missing product ID')
      return
    }

    setIsDeleting(true)
    try {
      await delRecommendProducts({
        customerId: String(customerId),
        productIds: [product.id],
      })

      toast.success('Recommend product deleted successfully')
      setIsDeleteDialogOpen(false)
      onDeleteSuccess?.()
    } catch (error) {
      console.error('Failed to delete recommend product:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete recommend product. Please try again.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

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
          className='group h-7 border-gray-200 px-2 text-xs text-gray-500'
          onMouseDown={stopEventPropagation}
          onPointerDown={stopEventPropagation}
          onClick={handleDeleteClick}
        >
          <Trash2
            className={cn(TRASH_DELETE_ICON_CLASS, 'mr-1 h-3.5 w-3.5')}
          />
        </Button>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
        }}
        handleConfirm={handleConfirmDelete}
        destructive
        isLoading={isDeleting}
        title={
          <span className='text-destructive'>
            <AlertTriangle
              className='stroke-destructive me-1 inline-block'
              size={18}
            />{' '}
            Delete Recommend Product
          </span>
        }
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this recommend product?
              <br />
              This action cannot be undone.
            </p>
            {product.spu && (
              <p className='text-muted-foreground text-sm'>
                SPU: <strong>{product.spu}</strong>
              </p>
            )}
          </>
        }
        confirmText='Delete'
      />

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
              productTitle={
                (() => {
                  const en = (apiProduct as Record<string, unknown> | null)?.hzkj_enname
                  if (en != null) {
                    const val = typeof en === 'string' ? en : (en as Record<string, unknown>)?.GLang
                    if (val != null && String(val).trim()) return String(val)
                  }
                  return product.name
                })()
              }
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
