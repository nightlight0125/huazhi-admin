import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

interface OrdersImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean | null) => void
}

export function OrdersImportDialog({ open, onOpenChange }: OrdersImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleImport = () => {
    if (file) {
      // 这里应该处理文件导入逻辑
      console.log('导入文件:', file.name)
      onOpenChange(false)
      setFile(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导入订单</DialogTitle>
          <DialogDescription>
            选择 CSV 或 Excel 文件来批量导入订单数据
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='file'>选择文件</Label>
            <Input
              id='file'
              type='file'
              accept='.csv,.xlsx,.xls'
              onChange={handleFileChange}
            />
          </div>
          {file && (
            <div className='text-sm text-muted-foreground'>
              已选择文件: {file.name}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={!file}>
            <Upload className='mr-2 h-4 w-4' />
            导入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
