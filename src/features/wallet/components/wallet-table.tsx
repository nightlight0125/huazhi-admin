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
import { getInvoiceRecords, type ApiInvoiceRecordItem } from '@/lib/api/orders'
import { getWalletList, type ApiFundRecordItem } from '@/lib/api/wallet'
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
import { useEffect, useRef, useState } from 'react'
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
    // 对应后端：hzkj_description
    description: item.hzkj_description || '',
    // 对应后端：hzkj_method
    paymentMethod: item.hzkj_method || '',
    date,
    // 对应后端：hzkj_amountfield
    amount:
      typeof item.hzkj_amountfield === 'number' ? item.hzkj_amountfield : 0,
    // 对应后端：hzkj_amountfield2
    cashback:
      typeof item.hzkj_amountfield2 === 'number'
        ? item.hzkj_amountfield2
        : undefined,
    // notes 列已删除，这里保持为空字符串但不展示
    notes: '',
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
  // Recharge Records 的日期范围过滤（hzkj_datetimefield_start / end）
  const [rechargeDateRange, setRechargeDateRange] = useState<{
    from?: Date
    to?: Date
  } | null>(null)
  // Recharge Records 的文本搜索（hzkj_customer_masterid）
  const [rechargeSearch, setRechargeSearch] = useState<string>('')
  // Invoice Records 的日期范围过滤
  const [invoiceDateRange, setInvoiceDateRange] = useState<{
    from?: Date
    to?: Date
  } | null>(null)
  // Invoice Records 的搜索（Clients Order Number），使用本地状态，避免重复请求
  const [invoiceSearch, setInvoiceSearch] = useState<string>('')

  // 避免开发环境 StrictMode 导致的重复请求
  const lastRechargeRequestKeyRef = useRef<string | null>(null)
  const lastInvoiceRequestKeyRef = useRef<string | null>(null)

  // 将日期转换为后端需要的格式：YYYY-MM-DD HH:mm:ss
  const formatDateTimeForApi = (date: Date, isEnd: boolean): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    // 如果只是按日期筛选，这里通常用一天的开始/结束时间
    const hour = isEnd ? '23' : '00'
    const minute = '00'
    const second = '00'

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  // 使用URL状态管理
  const {
    globalFilter: _urlGlobalFilter,
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
        const masterId = rechargeSearch.trim() || undefined
        const start =
          rechargeDateRange?.from != null
            ? formatDateTimeForApi(rechargeDateRange.from, false)
            : undefined
        const end =
          rechargeDateRange?.to != null
            ? formatDateTimeForApi(rechargeDateRange.to, true)
            : undefined

        const requestKey = JSON.stringify({
          customerId,
          pageNo,
          pageSize,
          start,
          end,
          masterId,
        })
        if (lastRechargeRequestKeyRef.current === requestKey) {
          return
        }
        lastRechargeRequestKeyRef.current = requestKey

        const result = await getWalletList(
          String(customerId),
          pageNo,
          pageSize,
          start,
          end,
          masterId
        )
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
    rechargeDateRange?.from,
    rechargeDateRange?.to,
    rechargeSearch,
  ])

  // 获取 Invoice Records（直接使用后端返回的原始数据）
  useEffect(() => {
    const fetchInvoiceRecords = async () => {
      if (activeTab !== 'invoice') {
        return
      }

      const customerId = auth.user?.customerId 
     

      setIsLoadingInvoice(true)
      try {
        const pageNo = urlPagination.pageIndex + 1
        const pageSize = urlPagination.pageSize
        const searchValue = invoiceSearch.trim() || undefined
        // 将前端日期范围映射为后端需要的字段
        const start =
          invoiceDateRange?.from != null
            ? formatDateTimeForApi(invoiceDateRange.from, false)
            : undefined
        const end =
          invoiceDateRange?.to != null
            ? formatDateTimeForApi(invoiceDateRange.to, true)
            : undefined

        const requestKey = JSON.stringify({
          customerId,
          pageNo,
          pageSize,
          start,
          end,
          searchValue,
        })
        if (lastInvoiceRequestKeyRef.current === requestKey) {
          return
        }
        lastInvoiceRequestKeyRef.current = requestKey

        const result = await getInvoiceRecords(
          String(customerId),
          pageNo,
          pageSize,
          start,
          end,
          searchValue
        )
        const rowsWithCreatedAt = (result.rows || []).map((item) => {
          let createdAt: Date | undefined
          const raw = item.hzkj_datetimefield
          if (typeof raw === 'string' && raw) {
            const normalized = raw.replace(' ', 'T')
            const parsed = new Date(normalized)
            createdAt = isNaN(parsed.getTime()) ? undefined : parsed
          }
          return {
            ...item,
            createdAt,
          }
        })
        setInvoiceRecords(rowsWithCreatedAt)
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
    invoiceDateRange?.from,
    invoiceDateRange?.to,
    invoiceSearch, // 搜索框内容变化时重新请求 Invoice Records（仅 Invoice tab）
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
      // 搜索全部由服务端处理，这里不使用全局过滤
      globalFilter: '',
      pagination: urlPagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    // 所有搜索都交给服务端处理，这里不过滤
    globalFilterFn: () => true,
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
        onValueChange={(value) => {
          const nextTab = value as WalletRecordType
          setActiveTab(nextTab)

          // 切换 tab 时清空筛选条件与分页
          setRowSelection({})
          setSorting([])
          setColumnVisibility({})

          // 分页重置到第一页
          onPaginationChange?.((prev) => ({
            ...prev,
            pageIndex: 0,
          }))

          // 清空本地筛选状态
          setRechargeSearch('')
          setRechargeDateRange(null)
          setInvoiceDateRange(null)
          setInvoiceSearch('')
        }}
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
            onSearch={(searchValue) => {
              const value = searchValue.trim()
              if (activeTab === 'invoice') {
                // Invoice Records：只更新本地搜索状态，由 useEffect 调接口
                setInvoiceSearch(value)
              } else {
                // Recharge Records：只更新本地搜索状态，由 useEffect 调接口
                setRechargeSearch(value)
              }
            }}
            dateRange={{
              enabled: true,
              columnId: 'createdAt',
              onDateRangeChange: (dateRange) => {
                if (activeTab === 'invoice') {
                  setInvoiceDateRange(dateRange ?? null)
                } else if (activeTab === 'recharge') {
                  setRechargeDateRange(dateRange ?? null)
                }
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
