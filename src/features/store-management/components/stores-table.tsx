import { useEffect, useMemo, useState } from 'react'
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
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from '@/features/tasks/components/data-table-bulk-actions'
import { type Store } from '../data/schema'
import { createStoresColumns } from './stores-columns'
import { EditStoreNameDialog } from './edit-store-name-dialog'

const route = getRouteApi('/_authenticated/store-management')

type DataTableProps = {
  data: Store[]
  totalCount?: number
  onRefresh?: () => void
}

export function StoresTable({ data, totalCount, onRefresh }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)

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
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  const handleEditStoreName = (store: Store) => {
    setEditingStore(store)
    setEditDialogOpen(true)
  }

  const handleConfirmEdit = (newStoreName: string) => {
    if (editingStore) {
      console.log('Update store name:', editingStore.id, newStoreName)
      // TODO: 实现实际的更新逻辑
      // 这里可以调用 API 更新 store name
    }
  }

  const columns = useMemo(
    () =>
      createStoresColumns({
        onEditStoreName: handleEditStoreName,
        onUnbindSuccess: onRefresh,
      }),
    [onRefresh]
  )

  // 计算总页数（服务端分页）
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
      const storeId = String(row.getValue('id') || '').toLowerCase()
      const storeName = String(row.getValue('name') || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return storeId.includes(searchValue) || storeName.includes(searchValue)
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

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by store name or ID...'
      />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={
                        header.column.id === 'select' ||
                        header.column.id === 'name'
                          ? 'pr-2 pl-1'
                          : undefined
                      }
                      style={{
                        width:
                          header.getSize() !== 150
                            ? `${header.getSize()}px`
                            : undefined,
                        minWidth: `${header.getSize()}px`,
                      }}
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === 'select' || cell.column.id === 'name'
                          ? 'pr-2 pl-1'
                          : undefined
                      }
                      style={{
                        width:
                          cell.column.getSize() !== 150
                            ? `${cell.column.getSize()}px`
                            : undefined,
                        minWidth: `${cell.column.getSize()}px`,
                      }}
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
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />

      {editingStore && (
        <EditStoreNameDialog
          open={editDialogOpen}
          onOpenChange={(open: boolean) => {
            setEditDialogOpen(open)
            if (!open) {
              setEditingStore(null)
            }
          }}
          storeName={editingStore.name}
          onConfirm={handleConfirmEdit}
        />
      )}
    </div>
  )
}
