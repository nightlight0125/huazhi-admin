import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { File } from 'lucide-react'
import { useBrands } from './brands-provider'

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function BrandsDialogs() {
  const { open, setOpen, currentRow } = useBrands()

  const handleEdit = () => {
    if (currentRow) {
      console.log('编辑品牌项目:', currentRow)
      alert(`编辑品牌项目: ${currentRow.name}`)
    }
    setOpen(null)
  }

  const handleDelete = () => {
    if (currentRow) {
      console.log('删除品牌项目:', currentRow)
      alert(`品牌项目 "${currentRow.name}" 已删除`)
    }
    setOpen(null)
  }

  return (
    <>
      {/* 查看详情对话框 */}
      <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>品牌项目详情</DialogTitle>
            <DialogDescription>
              查看品牌项目 "{currentRow?.name}" 的详细信息
            </DialogDescription>
          </DialogHeader>
          
          {currentRow && (
            <div className='space-y-4 py-4'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 rounded-lg border flex items-center justify-center bg-muted'>
                  <File className='h-8 w-8 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>{currentRow.name}</h3>
                  <div className='flex gap-2 mt-2'>
                    <Badge variant='outline'>
                      {currentRow.size === 'large' ? '大' : currentRow.size === 'medium' ? '中' : '小'}
                    </Badge>
                    <Badge variant='secondary'>
                      {currentRow.fileType.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className='space-y-2'>
                <div>
                  <h4 className='font-medium'>文件信息</h4>
                  <p className='text-sm text-muted-foreground'>文件名: {currentRow.fileName}</p>
                  {currentRow.fileSize && (
                    <p className='text-sm text-muted-foreground'>
                      文件大小: {formatFileSize(currentRow.fileSize)}
                    </p>
                  )}
                </div>
                
                {currentRow.notes && (
                  <div>
                    <h4 className='font-medium'>备注</h4>
                    <p className='text-sm text-muted-foreground'>{currentRow.notes}</p>
                  </div>
                )}
                
                <div>
                  <h4 className='font-medium'>创建时间</h4>
                  <p className='text-sm text-muted-foreground'>
                    {currentRow.createdAt.toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={open === 'edit'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>编辑品牌项目</DialogTitle>
            <DialogDescription>
              编辑品牌项目 "{currentRow?.name}" 的信息
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(null)}>
              取消
            </Button>
            <Button onClick={handleEdit}>
              确认编辑
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除对话框 */}
      <Dialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>删除品牌项目</DialogTitle>
            <DialogDescription>
              您确定要删除品牌项目 "{currentRow?.name}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(null)}>
              取消
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
