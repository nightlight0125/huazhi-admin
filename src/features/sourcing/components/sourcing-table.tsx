import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { ImageSearchInput } from '@/components/image-search-input'
import { products } from '@/features/products/data/data'
import { sourcingStatuses } from '../data/data'
import { type Sourcing } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { EditSourcingDialog } from './edit-sourcing-dialog'
import { NewSourcingDialog } from './new-sourcing-dialog'
import { createSourcingColumns } from './sourcing-columns'

const route = getRouteApi('/_authenticated/sourcing/')

type DataTableProps = {
  data: Sourcing[]
}

export function SourcingTable({ data }: DataTableProps) {
  const navigate = route.useNavigate()

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [isNewSourcingDialogOpen, setIsNewSourcingDialogOpen] = useState(false)
  const [isEditSourcingDialogOpen, setIsEditSourcingDialogOpen] =
    useState(false)
  const [editingSourcing, setEditingSourcing] = useState<Sourcing | null>(null)
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false)
  const [remarkSourcing, setRemarkSourcing] = useState<Sourcing | null>(null)

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate() as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  const columns = createSourcingColumns({
    onEdit: (sourcing) => {
      setEditingSourcing(sourcing)
      setIsEditSourcingDialogOpen(true)
    },
    onRemarkClick: (sourcing) => {
      if (!sourcing.productId) return
      setRemarkSourcing(sourcing)
      setIsRemarkDialogOpen(true)
    },
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const sourcingId = String(row.getValue('sourcingId')).toLowerCase()
      const productName = String(row.original.productName || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        sourcingId.includes(searchValue) || productName.includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  const linkedProduct = remarkSourcing?.productId
    ? products.find((p) => p && (p as any).id === remarkSourcing.productId)
    : undefined

  return (
    <>
      <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
        <div className='flex justify-end'>
          <Button
            className='h-8 text-xs'
            size='sm'
            onClick={() => setIsNewSourcingDialogOpen(true)}
          >
            <Plus className='mr-1 h-3.5 w-3.5' />
            New Sourcing
          </Button>
        </div>
        <DataTableToolbar
          table={table}
          searchPlaceholder='search'
          showSearch={false}
          customFilterSlot={
            <ImageSearchInput
              value={globalFilter || ''}
              onChange={(e) => onGlobalFilterChange?.(e.target.value)}
              onImageSearchClick={() => {
                /* 打开上传图片 / 图片搜索弹窗 */
              }}
            />
          }
          filters={[
            {
              columnId: 'status',
              title: 'status',
              options: [...sourcingStatuses],
            },
          ]}
        />
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className='text-xs font-medium'
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='text-xs'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='py-2'>
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
        <DataTablePagination table={table} />
      </div>

      <NewSourcingDialog
        open={isNewSourcingDialogOpen}
        onOpenChange={setIsNewSourcingDialogOpen}
      />

      <EditSourcingDialog
        open={isEditSourcingDialogOpen}
        onOpenChange={(open) => {
          setIsEditSourcingDialogOpen(open)
          if (!open) {
            setEditingSourcing(null)
          }
        }}
        sourcing={editingSourcing}
      />

      <DataTableBulkActions table={table} />

      {/* Remark 点击后的预览弹框 */}
      <Dialog
        open={isRemarkDialogOpen}
        onOpenChange={(open) => {
          setIsRemarkDialogOpen(open)
          if (!open) {
            setRemarkSourcing(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
          </DialogHeader>

          {remarkSourcing && (
            <div className='flex gap-3'>
              {linkedProduct && (linkedProduct as any).image ? (
                <img
                  src={(linkedProduct as any).image}
                  alt={(linkedProduct as any).name}
                  className='h-20 w-20 rounded object-cover'
                />
              ) : remarkSourcing.images && remarkSourcing.images.length > 0 ? (
                <img
                  src={remarkSourcing.images[0]}
                  alt={remarkSourcing.productName}
                  className='h-20 w-20 rounded object-cover'
                />
              ) : (
                <div className='bg-muted text-muted-foreground flex h-20 w-20 items-center justify-center rounded text-xs'>
                  No Image
                </div>
              )}

              <div className='space-y-1 text-xs'>
                <div className='line-clamp-2 font-medium'>
                  {(linkedProduct as any)?.name ?? remarkSourcing.productName}
                </div>
                <div className='text-muted-foreground'>
                  SPU: {(linkedProduct as any)?.sku ?? '-'}
                </div>
                <div className='text-muted-foreground'>
                  Price:{' '}
                  {linkedProduct && (linkedProduct as any).price
                    ? `$${Number((linkedProduct as any).price).toFixed(2)}`
                    : '-'}
                </div>
              </div>
            </div>
          )}

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsRemarkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={() => {
                if (!remarkSourcing?.productId) return
                const pid = remarkSourcing.productId
                setIsRemarkDialogOpen(false)
                navigate({
                  to: '/products/$productId',
                  params: { productId: pid },
                  search: { from: undefined },
                })
              }}
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
