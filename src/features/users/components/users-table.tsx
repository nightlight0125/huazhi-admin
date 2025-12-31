import { useEffect, useRef, useState } from 'react'
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
import { queryRole, type RoleItem } from '@/lib/api/users'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
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
  onFiltersChange?: (filters: {
    role?: string[]
    status?: string[]
    username?: string
  }) => void
}

export function UsersTable({
  data,
  search,
  navigate,
  totalCount,
  onFiltersChange,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  // 用于跟踪是否是用户操作导致的过滤器变化（避免初始化时触发）
  const isInitialMount = useRef(true)
  const prevColumnFiltersRef = useRef<string>('')

  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleList = await queryRole(1, 100)
        setRoles(roleList)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }
    fetchRoles()
  }, [])

  const {
    columnFilters,
    onColumnFiltersChange: originalOnColumnFiltersChange,
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
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })

  useEffect(() => {
    const usernameFromSearch = (search.username as string) || ''
    if (usernameFromSearch && usernameFromSearch !== searchInputValue) {
      setSearchInputValue(usernameFromSearch)
    }
  }, [search.username])

  const pageCount = Math.ceil(totalCount / pagination.pageSize)

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
    onColumnFiltersChange: originalOnColumnFiltersChange,
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

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevColumnFiltersRef.current = JSON.stringify(columnFilters)
      return
    }

    const currentFiltersStr = JSON.stringify(columnFilters)
    if (currentFiltersStr === prevColumnFiltersRef.current) {
      return
    }

    prevColumnFiltersRef.current = currentFiltersStr

    if (!onFiltersChange) return

    const roleFilter = columnFilters.find((f) => f.id === 'role')
    const statusFilter = columnFilters.find((f) => f.id === 'status')

    const role = Array.isArray(roleFilter?.value)
      ? roleFilter.value.length > 0
        ? roleFilter.value
        : undefined
      : undefined
    const status = Array.isArray(statusFilter?.value)
      ? statusFilter.value.length > 0
        ? statusFilter.value
        : undefined
      : undefined

    console.log('Filter values from columnFilters:', {
      columnFilters,
      roleFilter,
      statusFilter,
      role,
      status,
      searchInputValue,
    })

    onFiltersChange({
      role,
      status,
      username: searchInputValue || undefined,
    })
  }, [columnFilters, onFiltersChange, searchInputValue])

  const handleFilterChange = () => {}

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    const usernameColumn = table.getColumn('username')
    if (usernameColumn) {
      usernameColumn.setFilterValue(searchInputValue)
    }

    if (onFiltersChange) {
      // 从 columnFilters 状态中提取值（更可靠）
      const roleFilter = columnFilters.find((f) => f.id === 'role')
      const statusFilter = columnFilters.find((f) => f.id === 'status')

      const role = Array.isArray(roleFilter?.value)
        ? roleFilter.value.length > 0
          ? roleFilter.value
          : undefined
        : undefined
      const status = Array.isArray(statusFilter?.value)
        ? statusFilter.value.length > 0
          ? statusFilter.value
          : undefined
        : undefined

      onFiltersChange({
        role,
        status,
        username: searchInputValue || undefined,
      })
    }
  }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='search'
        searchKey='username'
        showSearchButton={true}
        onSearch={handleSearchClick}
        onFilterChange={handleFilterChange}
        filters={[
          {
            columnId: 'status',
            title: 'status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
          {
            columnId: 'role',
            title: 'role',
            options: roles.map((role) => ({
              label: role.name,
              value: role.id,
            })),
          },
        ]}
        customFilterSlot={
          <Input
            type='text'
            placeholder='search'
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchClick()
              }
            }}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        }
        showSearch={false}
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
            {table.getRowModel().rows?.length ? (
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
