import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { roleIcons } from '../data/data'
import { type Role } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const rolesColumns: ColumnDef<Role>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='选择全部'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择行'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色名称' />
    ),
    cell: ({ row }) => {
      const { name, value } = row.original
      const Icon = roleIcons[value as keyof typeof roleIcons]
      return (
        <div className='flex items-center gap-x-2'>
          {Icon && (
            <Icon size={16} className='text-muted-foreground' />
          )}
          <LongText className='max-w-36'>{name}</LongText>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色标识' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap font-mono text-sm'>
        {row.getValue('value')}
      </div>
    ),
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>{row.getValue('description')}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'permissions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='权限' />
    ),
    cell: ({ row }) => {
      const permissions = row.getValue('permissions') as string[]
      return (
        <div className='flex flex-wrap gap-1'>
          {permissions.slice(0, 3).map((permission) => (
            <Badge key={permission} variant='secondary' className='text-xs'>
              {permission}
            </Badge>
          ))}
          {permissions.length > 3 && (
            <Badge variant='outline' className='text-xs'>
              +{permissions.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'userCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户数量' />
    ),
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('userCount')}</div>
    ),
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
    cell: DataTableRowActions,
  },
]
