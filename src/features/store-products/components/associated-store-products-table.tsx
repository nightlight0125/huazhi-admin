import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { queryShopifyConnectedProducts } from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { Link2, Loader2, Minus, Plus, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { type StoreProduct } from '../data/schema'
import { AssociatedBulkActions } from './associated-bulk-actions'

interface AssociatedStoreProductsTableProps {
  data?: StoreProduct[]
}

export function AssociatedStoreProductsTable({
  data: _data,
}: AssociatedStoreProductsTableProps) {
  const { auth } = useAuthStore()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [disconnectProductId, setDisconnectProductId] = useState<string | null>(
    null
  )
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // 判断输入是否全是数字
  const isNumeric = (str: string) => {
    return /^\d+$/.test(str.trim())
  }

  // 使用 ref 来跟踪上一次的 globalFilter，以便在搜索条件改变时重置分页
  const prevGlobalFilterRef = useRef<string>('')

  // 当搜索条件改变时，重置到第一页
  useEffect(() => {
    if (prevGlobalFilterRef.current !== globalFilter) {
      prevGlobalFilterRef.current = globalFilter
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [globalFilter])

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.customerId
      const accountId = auth.user?.id

      if (!customerId || !accountId) {
        console.warn('Customer ID or Account ID not available')
        return
      }

      setIsLoading(true)
      try {
        // 构建请求参数
        const requestParams: any = {
          shopId: '2337110780475925504', // 写死的 shopId
          customerId: String(customerId),
          accountId: String(accountId),
          pageIndex: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
        }

        // 根据搜索条件添加参数
        if (globalFilter && globalFilter.trim()) {
          if (isNumeric(globalFilter)) {
            requestParams.productId = globalFilter.trim()
          } else {
            requestParams.productName = globalFilter.trim()
          }
        }

        const response = await queryShopifyConnectedProducts(requestParams)

        const apiProducts = response?.rows || []
        setData(apiProducts)
        setTotalCount(response?.totalCount || 0)
      } catch (error) {
        console.error('Failed to fetch Shopify connected products:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load products. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    auth.user?.customerId,
    auth.user?.id,
  ])

  // 获取选中的产品 ID
  const selectedIds = useMemo(() => {
    return new Set(
      Object.keys(rowSelection)
        .map((index) => {
          const item = data[Number(index)]
          return item?.entryId || item?.localSpuId || ''
        })
        .filter(Boolean)
    )
  }, [rowSelection, data])

  // 清除所有选中
  const handleClearSelection = () => {
    setRowSelection({})
  }

  // 处理断开连接
  const handleDisconnect = (productId: string) => {
    setDisconnectProductId(productId)
  }

  const handleConfirmDisconnect = () => {
    if (disconnectProductId) {
      // TODO: 实现断开连接逻辑
      console.log('Disconnect product:', disconnectProductId)
      setDisconnectProductId(null)
    }
  }

  // 切换展开/折叠
  const handleToggleExpand = (rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  // 创建列定义
  const columns = useMemo<ColumnDef<StoreProduct>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
            className='translate-y-[2px]'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='translate-y-[2px]'
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'storeName',
        header: 'Store Name',
        cell: ({ row }) => {
          const item = row.original
          if (!item) return null
          const hasItems = (item as any).items && (item as any).items.length > 0
          const isExpanded = expandedRows.has(row.id)
          return (
            <div className='flex items-center gap-2'>
              {hasItems && (
                <button
                  onClick={() => handleToggleExpand(row.id)}
                  className='flex h-5 w-5 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700'
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <Minus className='h-3.5 w-3.5' />
                  ) : (
                    <Plus className='h-3.5 w-3.5' />
                  )}
                </button>
              )}
              <span>{(item as any).shopName}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'name',
        header: 'Store Product',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex items-center gap-3'>
              <img
                src={item.shopSpuPicture}
                className='h-16 w-16 shrink-0 rounded object-cover'
              />
              <div className='flex flex-col gap-1'>
                <div
                  className='truncate text-sm font-medium'
                  style={{ maxWidth: '250px' }}
                  title={(item as any).shopSpuTitle}
                >
                  {(item as any).shopSpuTitle}
                </div>
                <div className='text-muted-foreground text-xs'>
                  Product ID: {(item as any).productID}
                </div>
                <div className='text-muted-foreground text-xs'>
                  Price: $
                  {parseFloat(
                    String((item as any).shopSpuPrice || '0')
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: 'disconnect',
        header: '',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex justify-center'>
              <button
                onClick={() =>
                  handleDisconnect(
                    (item as any).entryId || (item as any).localSpuId || ''
                  )
                }
                className='relative flex h-8 w-8 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
                aria-label='Disconnect product'
              >
                <Link2 className='h-4 w-4 text-white' />
                <Sparkles className='absolute -top-1 -left-1 h-3 w-3 text-white' />
              </button>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex items-center gap-3'>
              <div className='bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded object-cover'>
                <img
                  src={item.localSpuPicture}
                  className='h-16 w-16 shrink-0 rounded object-cover'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <div className='text-sm font-medium'>{item.localSpuId}</div>
                <div className='text-muted-foreground text-xs'>
                  TD SPU: {item.localSpuNumber}
                </div>
                <div className='text-muted-foreground text-xs'>
                  Price: $
                  {(typeof (item as any).localSpuPrice === 'number'
                    ? (item as any).localSpuPrice
                    : parseFloat(String((item as any).localSpuPrice || '0'))
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='text-muted-foreground text-xs'>
              {item.category || '---'}
            </div>
          )
        },
      },
    ],
    [expandedRows]
  )

  const pageCount =
    totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0

  const table = useReactTable({
    data: data,
    columns,
    state: {
      rowSelection,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: true, // 启用服务端分页
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row, index) => {
      if (!row.original) {
        return String(index)
      }
      const item = row.original as any
      return item.entryId || item.localSpuId || String(index)
    },
    // 移除客户端过滤，因为搜索在服务端进行
    globalFilterFn: () => true,
  })

  // 确保页码在有效范围内
  useEffect(() => {
    if (pageCount > 0 && pagination.pageIndex >= pageCount) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(0, pageCount - 1),
      }))
    }
  }, [pageCount, pagination.pageIndex])

  return (
    <div className='space-y-4'>
      <AssociatedBulkActions
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
      />
      <DataTableToolbar
        table={table}
        searchPlaceholder='enter store product\name\ID'
        searchKey='name'
        onSearch={(searchValue) => {
          // 当点击搜索按钮时，只更新 globalFilter 状态，触发 API 调用
          // 不更新表格的 globalFilter，因为输入框应该保持用户输入的值
          setGlobalFilter(searchValue)
        }}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className='text-xs font-medium'
                    style={{
                      width:
                        header.id === 'select'
                          ? '40px'
                          : header.id === 'storeName'
                            ? '160px'
                            : header.id === 'name'
                              ? '420px'
                              : header.id === 'disconnect'
                                ? '60px'
                                : header.id === 'product'
                                  ? '420px'
                                  : undefined,
                    }}
                  >
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
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const item = row.original
                const isExpanded = expandedRows.has(row.id)
                const hasItems =
                  item && (item as any).items && (item as any).items.length > 0

                return (
                  <>
                    <TableRow
                      key={row.id}
                      className='text-xs'
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
                    {isExpanded &&
                      hasItems &&
                      (item as any).items.map(
                        (variant: any, variantIndex: number) => (
                          <TableRow
                            key={`${row.id}-variant-${variantIndex}`}
                            className='bg-muted/50 text-xs'
                            data-state={row.getIsSelected() && 'selected'}
                          >
                            {/* Select column */}
                            <TableCell>
                              <Checkbox
                                checked={false}
                                disabled
                                aria-label='Select variant'
                                className='translate-y-[2px] opacity-50'
                              />
                            </TableCell>
                            {/* Store Name column */}
                            <TableCell>
                              <div className='flex items-center gap-2 pl-8'>
                                <span>{(item as any).shopName}</span>
                              </div>
                            </TableCell>
                            {/* Store Product column */}
                            <TableCell>
                              <div className='flex items-center gap-3'>
                                {variant.shopVariantPicture && (
                                  <img
                                    src={variant.shopVariantPicture}
                                    alt={variant.shopVariantTitle || 'Variant'}
                                    className='h-16 w-16 shrink-0 rounded object-cover'
                                  />
                                )}
                                <div className='flex flex-col gap-1'>
                                  <div
                                    className='truncate text-sm font-medium'
                                    style={{ maxWidth: '250px' }}
                                    title={
                                      variant.shopVariantTitle ||
                                      variant.localSkuCName ||
                                      'Variant'
                                    }
                                  >
                                    {variant.shopVariantTitle ||
                                      variant.localSkuCName ||
                                      'Variant'}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    Product ID:{' '}
                                    {variant.shopVariantId ||
                                      variant.localSkuNumber ||
                                      '-'}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    Price: $
                                    {parseFloat(
                                      String(variant.shopVariantPrice || '0')
                                    ).toFixed(2)}
                                  </div>
                                  {variant.localSkuValue && (
                                    <div className='text-muted-foreground text-xs'>
                                      {variant.localSkuValue}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            {/* Disconnect column */}
                            <TableCell>
                              <div className='flex justify-center'>
                                <button
                                  onClick={() =>
                                    handleDisconnect(
                                      variant.shopVariantId ||
                                        variant.localSkuNumber ||
                                        ''
                                    )
                                  }
                                  className='relative flex h-8 w-8 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
                                  aria-label='Disconnect variant'
                                >
                                  <Link2 className='h-4 w-4 text-white' />
                                  <Sparkles className='absolute -top-1 -left-1 h-3 w-3 text-white' />
                                </button>
                              </div>
                            </TableCell>
                            {/* Product column */}
                            <TableCell>
                              <div className='flex items-center gap-3'>
                                <div className='bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded object-cover'>
                                  {variant.localSkuPicture ? (
                                    <img
                                      src={variant.localSkuPicture}
                                      className='h-16 w-16 shrink-0 rounded object-cover'
                                    />
                                  ) : (
                                    <span className='text-muted-foreground text-xs'>
                                      POD
                                    </span>
                                  )}
                                </div>
                                <div className='flex flex-col gap-1'>
                                  <div className='text-sm font-medium'>
                                    {variant.localSkuEName || '-'}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    TD SPU: {variant.localSkuNumber || '---'}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    Price: $
                                    {(typeof variant.localSkuPrice === 'number'
                                      ? variant.localSkuPrice
                                      : parseFloat(
                                          String(variant.localSkuPrice || '0')
                                        )
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            {/* Category column */}
                            <TableCell>
                              <div className='text-muted-foreground text-xs'>
                                {variant.category || '---'}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                  </>
                )
              })
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

      <ConfirmDialog
        open={!!disconnectProductId}
        onOpenChange={(open) => {
          if (!open) {
            setDisconnectProductId(null)
          }
        }}
        title={
          <div className='flex items-center gap-2'>
            <span>Please Confirm if You Need to Disconnect</span>
          </div>
        }
        desc='Are you sure you want to disconnect this product?'
        confirmText='Confirm'
        cancelBtnText='Cancel'
        handleConfirm={handleConfirmDisconnect}
      />
    </div>
  )
}
