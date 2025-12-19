import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type Table,
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type SupportTicket, type SupportTicketStatus } from '../data/schema'
import { SupportTicketsBulkActions } from './support-tickets-bulk-actions'
import { createSupportTicketsColumns } from './support-tickets-columns'
import { SupportTicketsReasonDialog } from './support-tickets-reason-dialog'

const route = getRouteApi('/_authenticated/support-tickets/')

type SupportTicketsTableProps = {
  data: SupportTicket[]
}

export function SupportTicketsTable({ data }: SupportTicketsTableProps) {
  // Local UI state
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [activeTab, setActiveTab] = useState<SupportTicketStatus>('all')
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false)

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

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    if (activeTab === 'all') return data
    return data.filter((ticket) => ticket.status === activeTab)
  }, [data, activeTab])

  const handleEdit = (ticket: SupportTicket) => {
    console.log('Edit ticket:', ticket)
    // TODO: Implement edit functionality
  }

  const handleCancel = (ticket: SupportTicket) => {
    console.log('Cancel ticket:', ticket)
    // TODO: Implement cancel functionality
  }

  const handleReasonClick = () => {
    setReasonDialogOpen(true)
  }

  const columns = useMemo(
    () =>
      createSupportTicketsColumns({
        onEdit: handleEdit,
        onCancel: handleCancel,
        onReasonClick: handleReasonClick,
      }),
    []
  )

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
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const supportTicketNo = String(
        row.getValue('supportTicketNo') || ''
      ).toLowerCase()
      const hzOrderNo = String(row.original.hzOrderNo || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        supportTicketNo.includes(searchValue) || hzOrderNo.includes(searchValue)
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

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='enter ticket number Order No'
        filters={[
          {
            columnId: 'storeName',
            title: 'Store Name',
            options: [{ label: 'Store 1', value: 'Store 1' }],
          },
          {
            columnId: 'type',
            title: 'Type',
            options: [
              { label: 'Product return', value: 'Product return' },
              { label: 'Other', value: 'Other' },
            ],
          },
        ]}
        dateRange={{
          enabled: true,
          columnId: 'createTime',
          // onDateRangeChange: setDateRange,
          placeholder: 'Select  Date Range',
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
            {table.getRowModel().rows?.length ? (
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
