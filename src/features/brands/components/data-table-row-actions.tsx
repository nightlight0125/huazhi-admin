import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Download, Edit, Eye, Trash2 } from 'lucide-react'
import { TRASH_DELETE_ICON_CLASS } from '@/lib/delete-action-ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { brandItemSchema } from '../data/schema'
import { useBrands } from './brands-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const brandItem = brandItemSchema.parse(row.original)

  const { setOpen, setCurrentRow } = useBrands()

  const handleDownload = () => {
    // 这里可以实现文件下载逻辑
    alert(`正在下载文件: ${brandItem.fileName}`)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(brandItem)
            setOpen('view')
          }}
        >
          <Eye className='mr-2 h-4 w-4' />
          查看详情
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(brandItem)
            setOpen('edit')
          }}
        >
          <Edit className='mr-2 h-4 w-4' />
          编辑项目
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className='mr-2 h-4 w-4' />
          下载文件
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(brandItem)
            setOpen('delete')
          }}
          className='group text-gray-700 focus:text-gray-700 data-[highlighted]:text-red-600'
        >
          <Trash2 className={cn(TRASH_DELETE_ICON_CLASS, 'mr-2 h-4 w-4')} />
          删除
          <DropdownMenuShortcut>
            <Trash2 size={16} className={TRASH_DELETE_ICON_CLASS} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
