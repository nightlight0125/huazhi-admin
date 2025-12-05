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
import { type WithdrawRecord } from '../data/schema'
import { WithdrawRecordsBulkActions } from './withdraw-records-bulk-actions'
import { withdrawRecordsColumns } from './withdraw-records-columns'

interface WithdrawRecordsTableProps {
  data: WithdrawRecord[]
}

export function WithdrawRecordsTable({ data }: WithdrawRecordsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Fallback test data if no data is provided
  const testData: WithdrawRecord[] = [
    {
      id: '1',
      account: '1234567890',
      accountType: 'Bank Account',
      amount: 100.5,
      dateTime: new Date('2025-01-15T10:30:00'),
      status: 'Pending',
      remarks: 'Test withdrawal 1',
    },
    {
      id: '2',
      account: '0987654321',
      accountType: 'PayPal',
      amount: 250.75,
      dateTime: new Date('2025-01-16T14:20:00'),
      status: 'Completed',
      remarks: 'Successfully processed',
    },
    {
      id: '3',
      account: '1122334455',
      accountType: 'Alipay',
      amount: 500.0,
      dateTime: new Date('2025-01-17T09:15:00'),
      status: 'Processing',
      remarks: 'In progress',
    },
    {
      id: '4',
      account: '5566778899',
      accountType: 'WeChat Pay',
      amount: 75.25,
      dateTime: new Date('2025-01-18T16:45:00'),
      status: 'Failed',
      remarks: 'Transaction failed',
    },
    {
      id: '5',
      account: '9988776655',
      accountType: 'Bank Account',
      amount: 300.0,
      dateTime: new Date('2025-01-19T11:20:00'),
      status: 'Completed',
      remarks: undefined,
    },
  ]

  // Use provided data or fallback to test data
  const tableData = data && data.length > 0 ? data : testData

  useEffect(() => {
    console.log(
      'WithdrawRecordsTable data:',
      data?.length || 0,
      'Using:',
      tableData.length
    )
  }, [data, tableData])

  const table = useReactTable({
    data: tableData,
    columns: withdrawRecordsColumns,
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
      const account = String(row.getValue('account')).toLowerCase()
      const accountType = String(row.getValue('accountType')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return account.includes(searchValue) || accountType.includes(searchValue)
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
        searchPlaceholder='Enter Type'
        dateRange={{
          enabled: true,
          columnId: 'dateTime',
          placeholder: 'Pick a date range',
        }}
      />

      {/* Table */}
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
                  colSpan={withdrawRecordsColumns.length}
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
      <WithdrawRecordsBulkActions table={table} />
    </div>
  )
}
