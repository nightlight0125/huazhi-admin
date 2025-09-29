import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { type BrandItem } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const brandItemsColumns: ColumnDef<BrandItem>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='名称' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className='max-w-64'>
          <span className='font-medium leading-relaxed break-words text-wrap'>
            {name}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='尺寸' />
    ),
    cell: ({ row }) => {
      const size = row.getValue('size') as string
      const sizeLabels = {
        large: '大',
        medium: '中',
        small: '小',
      }
      return (
        <Badge variant='outline'>
          {sizeLabels[size as keyof typeof sizeLabels] || size}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'fileType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='文件类型' />
    ),
    cell: ({ row }) => {
      const fileType = row.getValue('fileType') as string
      return (
        <Badge variant='secondary'>
          {fileType.toUpperCase()}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'fileName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='文件名' />
    ),
    cell: ({ row }) => {
      const fileName = row.getValue('fileName') as string
      const fileSize = row.original.fileSize as number
      const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      }
      return (
        <div className='max-w-48'>
          <span className='text-sm font-medium truncate block'>
            {fileName}
          </span>
          {fileSize && (
            <span className='text-xs text-muted-foreground'>
              {formatFileSize(fileSize)}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='备注' />
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string
      return (
        <div className='max-w-48'>
          <span className='text-sm text-muted-foreground line-clamp-2'>
            {notes || '无备注'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='text-sm text-muted-foreground'>
          {date.toLocaleDateString('zh-CN')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
