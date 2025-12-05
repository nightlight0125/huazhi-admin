import { useEffect, useState } from 'react'
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
import { type RecommendedListRecord } from '../data/schema'
import { RecommendedListBulkActions } from './recommended-list-bulk-actions'
import { recommendedListColumns } from './recommended-list-columns'

interface RecommendedListTableProps {
  data: RecommendedListRecord[]
}

export function RecommendedListTable({ data }: RecommendedListTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    console.log('RecommendedListTable data:', data?.length || 0, data)
  }, [data])

  // Fallback test data if no data is provided
  const testData: RecommendedListRecord[] = [
    {
      id: '1',
      referee: '***us',
      registrationTime: new Date('2025-09-01T11:47:16'),
      commissionAmount: 21.62,
    },
    {
      id: '2',
      referee: '***er',
      registrationTime: new Date('2025-10-27T16:52:25'),
      commissionAmount: 4.3,
    },
    {
      id: '3',
      referee: '***ue',
      registrationTime: new Date('2025-08-13T10:58:19'),
      commissionAmount: 0.0,
    },
  ]

  // Use provided data or fallback to test data
  const tableData = data && data.length > 0 ? data : testData

  const table = useReactTable({
    data: tableData,
    columns: recommendedListColumns,
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
      <DataTableToolbar
        table={table}
        searchPlaceholder='Enter referee'
        dateRange={{
          enabled: true,
          columnId: 'registrationTime',
          placeholder: 'Pick a date range',
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
                  colSpan={recommendedListColumns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>
      <DataTablePagination table={table} />
      <RecommendedListBulkActions table={table} />
    </div>
  )
}
