import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProductConnections } from './product-connections-provider'
import { BrandCustomizationDialog } from './brand-customization-dialog'
import { type BrandItem } from '@/features/brands/data/schema'

export function ProductConnectionsDialogs() {
  const { open, setOpen, currentRow } = useProductConnections()

  const handleBrandConnect = (productId: string, brandType: keyof import('../data/schema').BrandConnection, brandItem: BrandItem) => {
    console.log('连接品牌:', productId, brandType, brandItem)
    // 这里可以添加实际的连接逻辑
    alert(`产品 ${productId} 已连接品牌项目: ${brandItem.name}`)
  }

  const handleBrandDisconnect = (productId: string, brandType: keyof import('../data/schema').BrandConnection) => {
    console.log('断开品牌连接:', productId, brandType)
    // 这里可以添加实际的断开连接逻辑
    alert(`产品 ${productId} 已断开品牌连接: ${brandType}`)
  }

  const handleBrandView = (brandItem: BrandItem) => {
    console.log('查看品牌项目:', brandItem)
    // 这里可以添加查看品牌项目的逻辑
    alert(`查看品牌项目: ${brandItem.name}`)
  }

  const handleDelete = () => {
    if (currentRow) {
      console.log('删除产品连接:', currentRow)
      // 这里可以添加删除的逻辑
      alert(`产品连接 "${currentRow.productName}" 已删除`)
    }
    setOpen(null)
  }

  return (
    <>
      {/* 品牌定制对话框 */}
      <BrandCustomizationDialog
        open={open === 'brand'}
        onOpenChange={(open) => !open && setOpen(null)}
        productConnection={currentRow}
        onConnect={handleBrandConnect}
        onDisconnect={handleBrandDisconnect}
        onView={handleBrandView}
      />

      {/* 删除对话框 */}
      <Dialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>删除产品连接</DialogTitle>
            <DialogDescription>
              您确定要删除产品连接 "{currentRow?.productName}" 吗？此操作无法撤销。
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
