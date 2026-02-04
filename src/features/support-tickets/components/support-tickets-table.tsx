import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { deleteOrder } from '@/lib/api/orders'
import { getUserShopList, type ShopListItem } from '@/lib/api/shop'
import { useAuthStore } from '@/stores/auth-store'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Table,
  type VisibilityState,
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { type SupportTicket, type SupportTicketStatus } from '../data/schema'
import { SupportTicketsBulkActions } from './support-tickets-bulk-actions'
import { createSupportTicketsColumns } from './support-tickets-columns'
import { SupportTicketsReasonDialog } from './support-tickets-reason-dialog'


type SupportTicketsTableProps = {
  data: SupportTicket[]
  search: Record<string, unknown>
  navigate: NavigateFn
  totalCount: number
  isLoading?: boolean
  onRefresh?: () => void
  dateRange?: DateRange | undefined
  onDateRangeChange?: (dateRange: DateRange | undefined) => void
  selectedStore?: string | undefined
  onStoreChange?: (store: string | undefined) => void
  selectedType?: string | undefined
  onTypeChange?: (type: string | undefined) => void
}

export function SupportTicketsTable({
  data,
  search,
  navigate,
  totalCount,
  isLoading = false,
  onRefresh,
  onDateRangeChange,
  selectedStore,
  onStoreChange,
  selectedType,
  onTypeChange,
}: SupportTicketsTableProps) {
  const { auth } = useAuthStore()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [activeTab, setActiveTab] = useState<SupportTicketStatus>('all')
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false)
  const [storeOptions, setStoreOptions] = useState<
    Array<{ label: string; value: string }>
  >([])

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      {
        columnId: 'storeName',
        searchKey: 'store',
        type: 'array',
      },
      {
        columnId: 'type',
        searchKey: 'type',
        type: 'array',
      },
    ],
  })

  // 监听 columnFilters 变化，同步到父组件
  useEffect(() => {
    const storeFilter = columnFilters.find((f) => f.id === 'storeName')
    const typeFilter = columnFilters.find((f) => f.id === 'type')
    
    if (onStoreChange) {
      const storeValue =
        storeFilter &&
        Array.isArray(storeFilter.value) &&
        storeFilter.value.length > 0
          ? String(storeFilter.value[0])
          : undefined
      const finalStoreValue = storeValue === '*' ? undefined : storeValue
      if (finalStoreValue !== selectedStore) {
        onStoreChange(finalStoreValue)
      }
    }
    
    if (onTypeChange) {
      const typeValue =
        typeFilter &&
        Array.isArray(typeFilter.value) &&
        typeFilter.value.length > 0
          ? String(typeFilter.value[0])
          : undefined
      const finalTypeValue = typeValue === '*' ? undefined : typeValue
      if (finalTypeValue !== selectedType) {
        onTypeChange(finalTypeValue)
      }
    }
  }, [columnFilters, selectedStore, selectedType, onStoreChange, onTypeChange])

  const filteredData = useMemo(() => {
    if (activeTab === 'all') return data
    return data.filter((ticket) => ticket.status === activeTab)
  }, [data, activeTab])

  const handleEdit = (ticket: SupportTicket) => {
    console.log('Edit ticket:', ticket)
    // TODO: Implement edit functionality
  }

  const handleDelete = useCallback(
    async (orderId: string) => {
      const customerId = auth.user?.customerId
      if (!customerId) {
        toast.error('Customer ID is required')
        return
      }

      try {
        await deleteOrder({
          customerId: String(customerId),
          orderId,
        })
        toast.success('Support ticket deleted successfully')
        // 刷新数据
        onRefresh?.()
      } catch (error) {
        console.error('Failed to delete support ticket:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to delete support ticket. Please try again.'
        )
        throw error
      }
    },
    [auth.user?.customerId, onRefresh]
  )

  const handleReasonClick = () => {
    setReasonDialogOpen(true)
  }

  const columns = useMemo(
    () =>
      createSupportTicketsColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onReasonClick: handleReasonClick,
      }),
    [handleDelete]
  )

  // 计算总页数
  const pageCount = Math.ceil(totalCount / pagination.pageSize)

  const table = useReactTable({
    data: filteredData,
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
    manualPagination: true,
    manualFiltering: true, // 启用服务端过滤
    pageCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  // 获取店铺列表
  useEffect(() => {
    const fetchStores = async () => {
      const userId = auth.user?.id
      if (!userId) {
        setStoreOptions([])
        return
      }

      try {
        const response = await getUserShopList({
          hzkjAccountId: userId,
          pageNo: 0,
          pageSize: 100, // 获取足够多的店铺
        })

        // 将店铺列表映射为选项格式
        const options = response.list
          .filter((shop: ShopListItem) => shop.id) // 过滤掉没有 id 的店铺
          .map((shop: ShopListItem) => ({
            label: shop.name || shop.platform || String(shop.id || ''),
            value: String(shop.id || ''),
          }))

        setStoreOptions(options)
      } catch (error) {
        console.error('Failed to fetch stores:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load stores. Please try again.'
        )
        setStoreOptions([])
      }
    }

    void fetchStores()
  }, [])

  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='enter ticket number Order No'
        filters={[
          {
            columnId: 'storeName',
            title: 'Store Name',
            options: storeOptions,
            singleSelect: true,
          },
          {
            columnId: 'type',
            title: 'Type',
            options: [
              { label: 'All Types', value: '*' },
              { label: 'Product return', value: 'Product return' },
              { label: 'Other', value: 'Other' },
            ],
            singleSelect: true,
          },
        ]}
        dateRange={{
          enabled: true,
          columnId: 'createTime',
          placeholder: 'Select Date Range',
          onDateRangeChange: (range) => {
            onDateRangeChange?.(range)
          },
        }}
      />
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SupportTicketStatus)}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='processing'>Processing</TabsTrigger>
          <TabsTrigger value='finished'>Finished</TabsTrigger>
          <TabsTrigger value='refused'>Refused</TabsTrigger>
          <TabsTrigger value='cancelled'>Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='overflow-x-auto rounded-md border'>
        <UITable className='min-w-[1100px]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center py-4'>
                    <p className='text-muted-foreground'>Loading support tickets...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      <DataTablePagination table={table as Table<SupportTicket>} />
      <SupportTicketsBulkActions table={table as Table<SupportTicket>} />

      <SupportTicketsReasonDialog
        open={reasonDialogOpen}
        onOpenChange={setReasonDialogOpen}
      />
    </div>
  )
}
