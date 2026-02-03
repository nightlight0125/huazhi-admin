import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
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
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { getWalletList, type ApiFundRecordItem } from '@/lib/api/wallet'
import { getInvoiceRecords, type ApiInvoiceRecordItem } from '@/lib/api/orders'
import { useAuthStore } from '@/stores/auth-store'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { walletRecordTypes } from '../data/data'
import { type WalletRecord, type WalletRecordType } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { createInvoiceColumns, createWalletColumns } from './wallet-columns'

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
  
  // Invoice Records 的状态（使用原始 API 数据）
  const [invoiceRecords, setInvoiceRecords] = useState<ApiInvoiceRecordItem[]>([])
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false)
  const [totalInvoiceCount, setTotalInvoiceCount] = useState(0)

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

      const customerId = auth.user?.customerId 
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

  // 获取 Invoice Records（直接使用后端返回的原始数据）
  useEffect(() => {
    const fetchInvoiceRecords = async () => {
      if (activeTab !== 'invoice') {
        return
      }

      const customerId = auth.user?.customerId 
      if (!customerId) {
        setInvoiceRecords([])
        setTotalInvoiceCount(0)
        return
      }

      setIsLoadingInvoice(true)
      try {
        const pageNo = urlPagination.pageIndex + 1
        const pageSize = urlPagination.pageSize

        const result = await getInvoiceRecords(String(customerId), pageNo, pageSize)
        // 直接使用后端返回的原始数据，不进行转换
        setInvoiceRecords(result.rows)
        setTotalInvoiceCount(result.totalCount)
      } catch (error) {
        console.error('Failed to fetch invoice records:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load invoice records. Please try again.'
        )
        setInvoiceRecords([])
        setTotalInvoiceCount(0)
      } finally {
        setIsLoadingInvoice(false)
      }
    }

    void fetchInvoiceRecords()
  }, [
    activeTab,
    urlPagination.pageIndex,
    urlPagination.pageSize,
    auth.user?.customerId,
    auth.user?.id,
  ])

  // 根据当前tab选择数据源和列定义
  const filteredData =
    activeTab === 'recharge'
      ? rechargeRecords
      : activeTab === 'invoice'
        ? invoiceRecords
        : data.filter((record) => {
            if (activeTab === 'invoice') return record.type === 'invoice'
            return true
          })

  // 根据 activeTab 选择不同的列定义
  const columns =
    activeTab === 'invoice' ? createInvoiceColumns() : createWalletColumns()

  // 这里同时支持两种数据结构（WalletRecord 和 ApiInvoiceRecordItem），
  // 为了简化类型推导，使用 any 让 Table 以运行时数据为准
  const table = useReactTable<any>({
    data: filteredData as any[],
    columns: columns as any,
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
      const searchValue = String(filterValue).toLowerCase()
      
      if (activeTab === 'invoice') {
        // Invoice Records: 搜索 Clients Order Number
        const item = row.original as ApiInvoiceRecordItem
        const clientsOrderNumber = String(
          item.hzkj_source_number || ''
        ).toLowerCase()
        return clientsOrderNumber.includes(searchValue)
      } else {
        // Recharge Records: 搜索原有字段
        const description = String(row.getValue('description')).toLowerCase()
        const paymentMethod = String(row.getValue('paymentMethod')).toLowerCase()
        const notes = String(row.getValue('notes') || '').toLowerCase()

        return (
          description.includes(searchValue) ||
          paymentMethod.includes(searchValue) ||
          notes.includes(searchValue)
        )
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel:
      activeTab === 'recharge' || activeTab === 'invoice' ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    pageCount:
      activeTab === 'recharge'
        ? Math.ceil(totalRechargeCount / urlPagination.pageSize)
        : activeTab === 'invoice'
          ? Math.ceil(totalInvoiceCount / urlPagination.pageSize)
          : undefined,
    manualPagination: activeTab === 'recharge' || activeTab === 'invoice',
  })

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <Tabs
        value={activeTab}
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
                {((isLoadingRecharge && activeTab === 'recharge') || 
                  (isLoadingInvoice && activeTab === 'invoice')) ? (
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
