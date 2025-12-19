import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { walletRecordTypes } from '../data/data'
import { type WalletRecord, type WalletRecordType } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { createWalletColumns } from './wallet-columns'

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
      const description = String(row.getValue('description')).toLowerCase()
      const paymentMethod = String(row.getValue('paymentMethod')).toLowerCase()
      const notes = String(row.getValue('notes') || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        description.includes(searchValue) ||
        paymentMethod.includes(searchValue) ||
        notes.includes(searchValue)
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

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <Tabs
        defaultValue='recharge'
        className='space-y-4'
        onValueChange={(value) => setActiveTab(value as WalletRecordType)}
      >
        <TabsList>
          {walletRecordTypes.map((type) => (
            <TabsTrigger
              key={type.value}
              value={type.value}
              className='data-[state=active]:text-primary flex items-center gap-2 px-4 text-sm'
            >
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className='space-y-4'>
          {/* Tabs 下方右侧导出按钮 */}
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              className='space-x-1'
              onClick={() => {
                // TODO: 接入实际导出逻辑（如导出为 CSV / Excel）
                console.log('Export wallet records (current tab):', activeTab)
              }}
            >
              Export
            </Button>
            <Button
              variant='outline'
              className='space-x-2'
              onClick={() => {
                // TODO: 接入实际导出逻辑（如导出为 CSV / Excel）
                console.log('Export wallet records (current tab):', activeTab)
              }}
            >
              Download Batch
            </Button>
          </div>

          <DataTableToolbar
            table={table}
            searchPlaceholder='Clents Order Number'
            dateRange={{
              enabled: true,
              columnId: 'createdAt',
              onDateRangeChange: (dateRange) => {
                console.log(dateRange)
              },
            }}
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
