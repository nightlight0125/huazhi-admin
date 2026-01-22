import { useEffect, useState } from 'react'
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
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getWalletList, type ApiFundRecordItem } from '@/lib/api/wallet'
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

// 将API返回的数据映射为WalletRecord格式
function mapApiWalletItemToWalletRecord(
  item: ApiFundRecordItem,
  index: number
): WalletRecord {
  // 解析日期字符串
  let date = new Date()
  if (item.hzkj_datetimefield) {
    const parsedDate = new Date(item.hzkj_datetimefield)
    date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate
  }

  // 映射状态（可能需要根据实际后端状态值调整）
  let status: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending'
  if (item.hzkj_status) {
    const statusLower = item.hzkj_status.toLowerCase()
    if (statusLower.includes('completed') || statusLower.includes('success')) {
      status = 'completed'
    } else if (statusLower.includes('failed') || statusLower.includes('fail')) {
      status = 'failed'
    } else if (statusLower.includes('cancel')) {
      status = 'cancelled'
    }
  }

  return {
    id: item.id || `wallet-${index}`,
    type: 'recharge',
    description: item.hzkj_description || '',
    paymentMethod: item.hzkj_method || '',
    date,
    amount:
      typeof item.hzkj_amountfield === 'number' ? item.hzkj_amountfield : 0,
    cashback:
      typeof item.hzkj_amountfield1 === 'number'
        ? item.hzkj_amountfield1
        : undefined,
    notes: '', // 全部展示空
    status,
    createdAt: date,
    updatedAt: date,
  }
}

export function WalletTable({ data }: DataTableProps) {
  const { auth } = useAuthStore()
  const [activeTab, setActiveTab] = useState<WalletRecordType>('recharge')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [rechargeRecords, setRechargeRecords] = useState<WalletRecord[]>([])
  const [isLoadingRecharge, setIsLoadingRecharge] = useState(false)
  const [totalRechargeCount, setTotalRechargeCount] = useState(0)

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

  // 获取充值记录
  useEffect(() => {
    const fetchRechargeRecords = async () => {
      if (activeTab !== 'recharge') {
        return
      }

      const customerId = auth.user?.customerId || auth.user?.id
      if (!customerId) {
        console.warn('No customer ID available')
        return
      }

      setIsLoadingRecharge(true)
      try {
        const pageNo = urlPagination.pageIndex + 1
        const pageSize = urlPagination.pageSize

        const result = await getWalletList(String(customerId), pageNo, pageSize)
        const mappedRecords = result.rows.map((item, index) =>
          mapApiWalletItemToWalletRecord(item, index)
        )
        setRechargeRecords(mappedRecords)
        setTotalRechargeCount(result.totalCount)
      } catch (error) {
        console.error('Failed to fetch recharge records:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load recharge records. Please try again.'
        )
        setRechargeRecords([])
        setTotalRechargeCount(0)
      } finally {
        setIsLoadingRecharge(false)
      }
    }

    void fetchRechargeRecords()
  }, [
    activeTab,
    urlPagination.pageIndex,
    urlPagination.pageSize,
    auth.user?.customerId,
    auth.user?.id,
  ])

  // 根据当前tab选择数据源
  const filteredData =
    activeTab === 'recharge'
      ? rechargeRecords
      : data.filter((record) => {
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
    getPaginationRowModel:
      activeTab === 'recharge' ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    pageCount:
      activeTab === 'recharge'
        ? Math.ceil(totalRechargeCount / urlPagination.pageSize)
        : undefined,
    manualPagination: activeTab === 'recharge',
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
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              className='space-x-1'
              onClick={() => {
                console.log('Export wallet records (current tab):', activeTab)
              }}
            >
              Export
            </Button>
            <Button
              variant='outline'
              className='space-x-2'
              onClick={() => {
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
                {isLoadingRecharge && activeTab === 'recharge' ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      加载中...
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
