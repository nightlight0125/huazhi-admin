import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function ProductPurchaseTest() {
  const { productId } = useParams({ from: '/_authenticated/products/$productId/purchase' })
  const navigate = useNavigate()
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: `/products/${productId}` })}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">购买页面测试</h1>
        <p className="text-muted-foreground">产品ID: {productId}</p>
      </div>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        购买页面加载成功！路由工作正常。
      </div>
    </div>
  )
}
