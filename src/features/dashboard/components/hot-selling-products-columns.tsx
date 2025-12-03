import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type HotSellingProduct } from '../data/schema'

export const createHotSellingProductsColumns =
  (): ColumnDef<HotSellingProduct>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      id: 'selectedStore',
      accessorFn: () => '', // 虚拟列，用于过滤
      header: () => null, // 不显示表头
      enableHiding: true,
      enableSorting: false,
      filterFn: (_row, _id, value) => {
        // 如果未选择任何值，显示所有数据
        if (!value || value.length === 0) return true
        // TODO: 根据实际数据中的 store 字段进行筛选
        // 目前返回 true 表示所有产品都匹配
        return true
      },
    },
    {
      accessorKey: 'ranking',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ranking' />
      ),
      cell: ({ row }) => (
        <div className='text-sm font-medium'>{row.getValue('ranking')}</div>
      ),
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Product Name' />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>{row.getValue('productName')}</div>
      ),
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const productName = String(row.getValue(id)).toLowerCase()
        const searchValue = String(value).toLowerCase()
        return productName.includes(searchValue)
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Quantity' />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>{row.getValue('quantity')}</div>
      ),
    },
    {
      accessorKey: 'sellingAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Selling Amount' />
      ),
      cell: ({ row }) => {
        const amount = row.getValue('sellingAmount') as number
        return <div className='text-sm font-medium'>${amount.toFixed(2)}</div>
      },
    },
  ]
