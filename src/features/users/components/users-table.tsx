import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { queryRole } from '@/lib/api/users'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type User } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type DataTableProps = {
  data: User[]
  search: Record<string, unknown>
  navigate: NavigateFn
  totalCount: number
  isLoading?: boolean
  onFiltersChange?: (filters: {
    role?: string[]
    status?: string[]
    username?: string
  }, forceRefresh?: boolean) => void
}

export function UsersTable({
  data,
  search,
  navigate,
  totalCount,
  isLoading = false,
  onFiltersChange,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  const prevColumnFiltersRef = useRef<string>('')
  const isInitialMount = useRef(true)
  const onFiltersChangeRef = useRef(onFiltersChange)
  
  // 更新 ref 中的回调函数
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange
  }, [onFiltersChange])

  const { auth } = useAuthStore()
  const roles = auth.roles

  useEffect(() => {
    if (roles.length === 0) {
      const fetchRoles = async () => {
        try {
          const roleList = await queryRole(1, 100)
          auth.setRoles(roleList)
        } catch (error) {}
      }
      fetchRoles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.length])

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      {
        columnId: 'role',
        searchKey: 'role',
        type: 'array',
        deserialize: (value: unknown) => {
          if (Array.isArray(value)) {
            return value.map((v) => String(v))
          }
          return []
        },
        serialize: (value: unknown) => {
          if (Array.isArray(value)) {
            return value.map((v) => String(v))
          }
          return []
        },
      },
    ],
  })

  useEffect(() => {
    const usernameFromSearch = (search.username as string) || ''
    if (usernameFromSearch && usernameFromSearch !== searchInputValue) {
      setSearchInputValue(usernameFromSearch)
    }
  }, [search.username])

  const pageCount = Math.ceil(totalCount / pagination.pageSize)

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name,
        value: String(role.id),
      })),
    [roles]
  )

  const filters = useMemo(
    () => [
      {
        columnId: 'status',
        title: 'status',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        singleSelect: true,
      },
      {
        columnId: 'role',
        title: 'role',
        options: roleOptions,
        singleSelect: true,
      },
    ],
    [roleOptions]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: true, // 启用服务端分页
    pageCount, // 设置总页数
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])


  // 监听筛选器变化并触发请求
  useEffect(() => {
    const currentFiltersStr = JSON.stringify(columnFilters)
    
    // 如果是初始挂载，只更新 ref，不触发请求（初始加载由父组件处理）
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevColumnFiltersRef.current = currentFiltersStr
      return
    }

    // 如果筛选器没有变化，不触发请求
    if (currentFiltersStr === prevColumnFiltersRef.current) {
      return
    }

    // 更新 ref
    prevColumnFiltersRef.current = currentFiltersStr
    
    // 重新计算 filters，确保使用最新的值
    const roleFilter = columnFilters.find((f) => f.id === 'role')
    const statusFilter = columnFilters.find((f) => f.id === 'status')
    const filters = {
      role:
        Array.isArray(roleFilter?.value) && roleFilter.value.length > 0
          ? roleFilter.value
          : undefined,
      status:
        Array.isArray(statusFilter?.value) && statusFilter.value.length > 0
          ? statusFilter.value
          : undefined,
      username: searchInputValue || undefined,
    }
    
    console.log('Filters changed, triggering request:', filters)
    
    // 使用 setTimeout 延迟执行，避免在快速连续变化时触发多次请求
    const timeoutId = setTimeout(() => {
      onFiltersChangeRef.current?.(filters)
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [columnFilters, searchInputValue])

  const handleSearchClick = (searchValue?: string) => {
    // 使用传入的 searchValue，如果没有则使用 searchInputValue
    const currentSearchValue = searchValue ?? searchInputValue
    
    console.log('handleSearchClick called with:', {
      searchValue,
      searchInputValue,
      currentSearchValue,
    })
    
    const usernameColumn = table.getColumn('username')
    if (usernameColumn) {
      usernameColumn.setFilterValue(currentSearchValue)
    }
    
    // 更新 searchInputValue 状态，确保同步
    setSearchInputValue(currentSearchValue)
    
    // 搜索按钮点击时，立即触发请求更新列表
    // 重新计算 filters，确保使用最新的搜索值
    const roleFilter = columnFilters.find((f) => f.id === 'role')
    const statusFilter = columnFilters.find((f) => f.id === 'status')
    const filters = {
      role:
        Array.isArray(roleFilter?.value) && roleFilter.value.length > 0
          ? roleFilter.value
          : undefined,
      status:
        Array.isArray(statusFilter?.value) && statusFilter.value.length > 0
          ? statusFilter.value
          : undefined,
      // 确保 username 字段正确传递，使用当前搜索值
      username: currentSearchValue.trim() || undefined,
    }
    
    console.log('Search button clicked, triggering request:', {
      currentSearchValue,
      'filters.username': filters.username,
      filters,
    })
    console.log('onFiltersChangeRef.current:', onFiltersChangeRef.current)
    
    // 更新 prevColumnFiltersRef，防止 useEffect 再次触发请求
    // 构建一个包含 username 的 filters 字符串来更新 ref
    const filtersWithUsername = JSON.stringify([
      ...columnFilters.filter((f) => f.id !== 'username'),
      { id: 'username', value: currentSearchValue },
    ])
    prevColumnFiltersRef.current = filtersWithUsername
    
    // 直接调用，确保搜索按钮点击时立即更新列表
    // 使用 setTimeout 确保在下一个事件循环中执行，避免与 setFilterValue 冲突
    setTimeout(() => {
      if (onFiltersChangeRef.current) {
        console.log('Calling onFiltersChange from search button with filters:', filters)
        // 传递第二个参数 forceRefresh=true 来强制刷新
        onFiltersChangeRef.current(filters, true)
      } else {
        console.warn('onFiltersChangeRef.current is null or undefined')
      }
    }, 0)
  }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='search'
        searchKey='username'
        showSearchButton={true}
        onSearch={handleSearchClick}
        onFilterChange={() => {}}
        filters={filters}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className ?? ''
                      )}
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className ?? ''
                      )}
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
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />
    </div>
  )
}
