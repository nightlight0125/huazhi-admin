import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableToolbar } from '@/components/data-table'
import { DataTablePagination } from '@/components/data-table'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { type WalletRecord, type WalletRecordType } from '../data/schema'
import { walletRecordTypes, walletRecordStatuses, customers } from '../data/data'
import { createWalletColumns } from './wallet-columns'
import { useTableUrlState } from '@/hooks/use-table-url-state'

const route = getRouteApi('/_authenticated/wallet')

interface DataTableProps {
  data: WalletRecord[]
}

export function WalletTable({ data }: DataTableProps) {
  const [activeTab, setActiveTab] = useState<WalletRecordType>('recharge')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  // 使用URL状态管理
  const {
    globalFilter: urlGlobalFilter,
    onGlobalFilterChange,
    columnFilters: urlColumnFilters,
    onColumnFiltersChange,
    pagination: urlPagination,
    onPaginationChange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: {
      pageKey: 'page',
      pageSizeKey: 'pageSize',
      defaultPage: 1,
      defaultPageSize: 10,
    },
    globalFilter: {
      enabled: true,
      key: 'filter',
      trim: true,
    },
    columnFilters: [
      {
        columnId: 'status',
        searchKey: 'status',
        type: 'array',
      },
      {
        columnId: 'customerName',
        searchKey: 'customer',
        type: 'array',
      },
    ],
  })

  // 根据当前tab过滤数据
  const filteredData = data.filter((record) => {
    if (activeTab === 'recharge') return record.type === 'recharge'
    if (activeTab === 'invoice') return record.type === 'invoice'
    return true
  })

  const columns = createWalletColumns()

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: urlColumnFilters,
      globalFilter: urlGlobalFilter,
      pagination: urlPagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const orderNumber = String(row.getValue('orderNumber')).toLowerCase()
      const customerName = String(row.getValue('customerName')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        orderNumber.includes(searchValue) ||
        customerName.includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('zh-CN', {
  //     style: 'currency',
  //     currency: 'CNY',
  //   }).format(amount)
  // }

  // const formatDate = (date: Date) => {
  //   return new Intl.DateTimeFormat('zh-CN', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   }).format(date)
  // }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <Tabs defaultValue='recharge' className='space-y-4' onValueChange={(value) => setActiveTab(value as WalletRecordType)}>
        <TabsList>
          {walletRecordTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className='flex items-center gap-2'>
              <type.icon className='h-4 w-4' />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className='space-y-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='搜索客户订单号、客户名称...'
            filters={[
              {
                columnId: 'status',
                title: '状态',
                options: [...walletRecordStatuses],
              },
              {
                columnId: 'customerName',
                title: '客户',
                options: [...customers],
              },
            ]}
          />

          <div className='rounded-md border'>
            <TableComponent>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                      没有找到记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableComponent>
          </div>

          <DataTablePagination table={table} />
          <DataTableBulkActions table={table} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
