import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  getCustomizationList,
  type CustomizationListItem,
} from '@/lib/api/products'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/_authenticated/packaging-products/')

const columns: ColumnDef<CustomizationListItem>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className='flex items-center gap-2'>
          {item.picture ? (
            <img
              src={String(item.picture)}
              alt={String(item.name || '')}
              className='h-10 w-10 rounded object-cover'
            />
          ) : (
            <div className='bg-muted h-10 w-10 rounded' />
          )}
          <span className='max-w-[220px] truncate'>{String(item.name || '---')}</span>
        </div>
      )
    },
    size: 260,
  },
  {
    id: 'sku',
    header: 'SKU',
    cell: ({ row }) => String(row.original.newNumber || '---'),
    size: 180,
  },
  {
    id: 'specs',
    header: 'Specs',
    cell: ({ row }) => String(row.original.size || '---'),
    size: 160,
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => String(row.original.type || '---'),
    size: 200,
  },
  {
    id: 'remark',
    header: 'Remark',
    cell: ({ row }) => String(row.original.remark || '---'),
  },
]

export function MyPackagingTable() {
  const { auth } = useAuthStore()
  const [data, setData] = useState<CustomizationListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const {
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate() as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  useEffect(() => {
    const customerId = String(auth.user?.customerId || auth.user?.id || '')
    if (!customerId) return

    const fetchList = async () => {
      try {
        setIsLoading(true)
        const response = await getCustomizationList({
          pageNo: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          customerId,
          brandName:
            typeof globalFilter === 'string' && globalFilter.trim()
              ? globalFilter.trim()
              : undefined,
        })
        setData(response.data?.list || [])
        setTotalCount(response.data?.totalCount || 0)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load customization list. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchList()
  }, [auth.user?.customerId, auth.user?.id, pagination.pageIndex, pagination.pageSize, globalFilter])

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater(pagination as PaginationState)
          : updater
      onPaginationChange(next)
    },
    onGlobalFilterChange,
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Name/SKU'
        showSearch
        showSearchButton
        onSearch={(value) => {
          onGlobalFilterChange?.(value)
          onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize })
        }}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
