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
import { AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { delBill } from '@/lib/api/sourcing'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
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
  onRefresh?: () => void
  totalCount?: number
}

export function SourcingTable({ data, onRefresh, totalCount }: DataTableProps) {
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingSourcing, setDeletingSourcing] = useState<Sourcing | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

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

  // 打开删除确认对话框
  const handleDeleteClick = (sourcing: Sourcing) => {
    setDeletingSourcing(sourcing)
    setIsDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingSourcing?.id) {
      toast.error('Cannot delete: missing bill ID')
      return
    }

    setIsDeleting(true)
    try {
      await delBill({
        billId: [deletingSourcing.id],
      })

      toast.success('Sourcing request deleted successfully')
      setIsDeleteDialogOpen(false)
      setDeletingSourcing(null)
      onRefresh?.()
    } catch (error) {
      console.error('Failed to delete sourcing request:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete sourcing request. Please try again.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

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
    onDelete: handleDeleteClick,
  })

  // 如果是服务端分页，计算总页数
  const pageCount =
    totalCount !== undefined
      ? Math.ceil(totalCount / pagination.pageSize)
      : undefined

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
    manualPagination: totalCount !== undefined, // 如果提供了 totalCount，启用服务端分页
    pageCount, // 设置总页数
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
    getPaginationRowModel:
      totalCount === undefined ? getPaginationRowModel() : undefined, // 服务端分页时不使用客户端分页模型
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const finalPageCount = pageCount ?? table.getPageCount()
  useEffect(() => {
    if (finalPageCount !== undefined) {
      ensurePageInRange(finalPageCount)
    }
  }, [finalPageCount, ensurePageInRange])

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
          filters={[
            {
              columnId: 'status',
              title: 'status',
              options: [...sourcingStatuses],
              singleSelect: true,
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
        onSuccess={() => {
          onRefresh?.()
        }}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setDeletingSourcing(null)
          }
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
            Delete Sourcing Request
          </span>
        }
        desc={
          deletingSourcing ? (
            <>
              <p className='mb-2'>
                Are you sure you want to delete this sourcing request?
                <br />
                This action cannot be undone.
              </p>
              {deletingSourcing.sourcingId && (
                <p className='text-muted-foreground text-sm'>
                  Sourcing ID: <strong>{deletingSourcing.sourcingId}</strong>
                </p>
              )}
            </>
          ) : (
            'Are you sure you want to delete this sourcing request? This action cannot be undone.'
          )
        }
        confirmText='Delete'
      />

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
