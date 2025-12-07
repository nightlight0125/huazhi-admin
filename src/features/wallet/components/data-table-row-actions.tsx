import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Download, Eye, FileText } from 'lucide-react'
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

interface DataTableRowActionsProps {
  row: Row<WalletRecord>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const [actionTitle, setActionTitle] = useState('')
  const [actionDescription, setActionDescription] = useState('')

  const record = row.original

  const handleAction = (type: string, title: string, description: string) => {
    setActionType(type)
    setActionTitle(title)
    setActionDescription(description)
    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    console.log(`执行操作: ${actionType}`, record)
    setShowConfirmDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label='Open menu'
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal className='h-4 w-4' aria-hidden='true' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => handleAction('view', '查看详情', `查看记录 ${record.id} 的详细信息`)}
          >
            <Eye className='mr-2 h-4 w-4' />
            View Details
          </DropdownMenuItem>
          
          {record.type === 'invoice' && record.invoiceUrl && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction('download_invoice', '下载发票', `下载发票 ${record.invoiceNumber || record.id}`)}
              >
                <Download className='mr-2 h-4 w-4' />
                Download Invoice
              </DropdownMenuItem>
            </>
          )}
          
          {record.type === 'recharge' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction('view_transaction', '查看交易', `查看交易 ${record.transactionId} 的详细信息`)}
              >
                <FileText className='mr-2 h-4 w-4' />
                View Transaction
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
