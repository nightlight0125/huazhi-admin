import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type CommissionRecord } from '../data/schema'
import { CommissionRecordsBulkActions } from './commission-records-bulk-actions'
import { commissionRecordsColumns } from './commission-records-columns'

interface CommissionRecordsTableProps {
  data: CommissionRecord[]
  totalCommission?: number
  onCashOut?: () => void
}

export function CommissionRecordsTable({
  data,
  totalCommission,
}: CommissionRecordsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const computedTotalCommission =
    typeof totalCommission === 'number'
      ? totalCommission
      : data.reduce((sum, record) => sum + record.commission, 0)

  const table = useReactTable({
    data,
    columns: commissionRecordsColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const referee = String(row.getValue('referee')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return referee.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <DataTableToolbar
          table={table}
          showSearch={false}
          showSearchButton={false}
          dateRange={{
            enabled: true,
            columnId: 'dateTime',
            placeholder: 'Pick a date range',
          }}
        />

        <div className='text-sm text-muted-foreground'>
          <span className='mr-1'>Total Commission:</span>
          <span className='font-semibold text-foreground'>
            ${computedTotalCommission.toFixed(2)}
          </span>
        </div>
      </div>

      <div className='rounded-md border'>
        <TableComponent>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className=''>
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
                  colSpan={commissionRecordsColumns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      {/* Bulk Actions */}
      <CommissionRecordsBulkActions table={table} />
    </div>
  )
}
