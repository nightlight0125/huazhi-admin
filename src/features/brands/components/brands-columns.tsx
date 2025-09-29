import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { type Brand } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const brandsColumns: ColumnDef<Brand>[] = [
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
    accessorKey: 'logo',
    header: 'Logo',
    cell: ({ row }) => {
      const logo = row.getValue('logo') as string
      return (
        <div className='w-12 h-12 rounded-lg overflow-hidden border'>
          <img
            src={logo || '/placeholder-logo.png'}
            alt='品牌Logo'
            className='w-full h-full object-cover'
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='品牌名称' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const navigate = useNavigate()
      
      const handleBrandClick = () => {
        navigate({ to: `/brands/${row.original.id}` })
      }
      
      return (
        <div className='max-w-48'>
          <Button
            variant="ghost"
            className='h-auto p-0 text-left justify-start hover:bg-muted/50 transition-colors'
            onClick={handleBrandClick}
          >
            <span className='font-medium leading-relaxed break-words text-wrap hover:text-primary'>
              {name}
            </span>
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <div className='max-w-64'>
          <span className='text-sm text-muted-foreground line-clamp-2'>
            {description || '暂无描述'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'components',
    header: '组件数量',
    cell: ({ row }) => {
      const components = row.getValue('components') as Brand['components']
      return (
        <div className='text-center'>
          <Badge variant='secondary'>
            {components.length} 个组件
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? '启用' : '禁用'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
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
