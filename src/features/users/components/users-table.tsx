import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useAuthStore } from '@/stores/auth-store'
import { queryRole } from '@/lib/api/users'
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
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  const isInitialMount = useRef(true)
  const prevColumnFiltersRef = useRef<string>('')

  const { auth } = useAuthStore()
  const roles = auth.roles

  // 如果角色列表为空，尝试加载（作为后备）
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
        // 在源头处理：确保 role 值始终是字符串数组
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
      },
      {
        columnId: 'role',
        title: 'role',
        options: roleOptions,
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

  // 提取过滤器值转换逻辑
  const extractFilters = useMemo(() => {
    const roleFilter = columnFilters.find((f) => f.id === 'role')
    const statusFilter = columnFilters.find((f) => f.id === 'status')

    return {
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
  }, [columnFilters, searchInputValue])

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
    onFiltersChange?.(extractFilters)
  }, [columnFilters, onFiltersChange, extractFilters])

  const handleSearchClick = () => {
    const usernameColumn = table.getColumn('username')
    if (usernameColumn) {
      usernameColumn.setFilterValue(searchInputValue)
    }
    onFiltersChange?.(extractFilters)
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
