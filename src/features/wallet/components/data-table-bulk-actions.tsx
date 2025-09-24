import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Download, FileDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type WalletRecord } from '../data/schema'
import { WalletConfirmDialog } from './wallet-confirm-dialog'

interface DataTableBulkActionsProps {
  table: Table<WalletRecord>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const [actionTitle, setActionTitle] = useState('')
  const [actionDescription, setActionDescription] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) {
    return null
  }

  const handleBulkAction = (type: string, title: string, description: string) => {
    setActionType(type)
    setActionTitle(title)
    setActionDescription(description)
    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    const selectedRecords = selectedRows.map(row => row.original)
    console.log(`执行批量操作: ${actionType}`, selectedRecords)
    
    // 这里可以添加实际的批量操作逻辑
    switch (actionType) {
      case 'download_invoices':
        // 批量下载发票
        console.log('批量下载发票:', selectedRecords.filter(r => r.type === 'invoice'))
        break
      case 'export_records':
        // 导出记录
        console.log('导出记录:', selectedRecords)
        break
      default:
        break
    }
    
    setShowConfirmDialog(false)
    table.resetRowSelection()
  }

  // 检查是否有发票记录
  const hasInvoiceRecords = selectedRows.some(row => row.original.type === 'invoice')

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {selectedCount} 条记录被选中
        </div>
        <div className='flex items-center space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='ml-auto hidden h-8 lg:flex'>
                <MoreHorizontal className='mr-2 h-4 w-4' />
                批量操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px]'>
              {hasInvoiceRecords && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction(
                      'download_invoices',
                      '批量下载发票',
                      `下载 ${selectedRows.filter(r => r.original.type === 'invoice').length} 张发票`
                    )}
                  >
                    <Download className='mr-2 h-4 w-4' />
                    下载发票
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => handleBulkAction(
                  'export_records',
                  '导出记录',
                  `导出 ${selectedCount} 条钱包记录`
                )}
              >
                <FileDown className='mr-2 h-4 w-4' />
                导出记录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <WalletConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={actionTitle}
        description={actionDescription}
        onConfirm={handleConfirm}
      />
    </>
  )
}
