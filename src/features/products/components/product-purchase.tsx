import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, MapPin, Package, CreditCard, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Stepper } from '@/components/ui/stepper'
import { products } from '../data/data'
import { BrandCustomizationDialog } from '@/features/product-connections/components/brand-customization-dialog'
import { type BrandItem } from '@/features/brands/data/schema'

// 购买步骤枚举
type PurchaseStep = 'connect' | 'destination' | 'review'

// 目的地选项
const destinations = [
  {
    id: 'hangzhou',
    name: 'Hangzhou',
    flag: '🇨🇳',
    description: '单击此处将批发产品导入 Dropsure Hangzhou 仓库。按照步骤接收报价,明确的价格,包括所有费用,直到交货。'
  },
  {
    id: 'shenzhen',
    name: 'Shenzhen',
    flag: '🇨🇳',
    description: '单击此处将批发产品导入 Dropsure Shenzhen 仓库。按照步骤接收报价,明确的价格,包括所有费用,直到交货。'
  },
  {
    id: 'united-states',
    name: 'United States',
    flag: '🇺🇸',
    description: '单击此处将批发产品导入 Dropsure United States 仓库。按照步骤接收报价,明确的价格,包括所有费用,直到交货。'
  },
  {
    id: 'gigab2b',
    name: 'GIGAB2B',
    flag: '🇺🇸',
    description: '单击此处将批发产品导入 Dropsure GIGAB2B 仓库。按照步骤接收报价,明确的价格,包括所有费用,直到交货。'
  }
]

export function ProductPurchase() {
  const { productId } = useParams({ from: '/_authenticated/products/$productId/purchase' })
  const navigate = useNavigate()
  
  console.log('ProductPurchase component loaded, productId:', productId)
  
  // 状态管理
  const [currentStep, setCurrentStep] = useState<PurchaseStep>('connect')
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [nonBulkPackaging, setNonBulkPackaging] = useState(true)
  const [isBrandCustomizationOpen, setIsBrandCustomizationOpen] = useState(false)
  
  // 品牌连接状态
  const [brandConnections, setBrandConnections] = useState({
    logo: { connected: true, brandItemId: 'logo-001', brandItemName: '企业Logo - 大尺寸' },
    card: { connected: false },
    productPackaging: { connected: false },
    shippingPackaging: { connected: false },
  })

  // 查找产品数据
  const product = products.find(p => p.id === productId)
  
  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">产品未找到</h2>
          <p className="text-muted-foreground mb-4">请检查产品ID是否正确: {productId}</p>
          <Button onClick={() => navigate({ to: '/products' })}>
            返回产品列表
          </Button>
        </div>
      </div>
    )
  }

  // 计算总价
  const totalPrice = product.price * quantity

  // 步骤配置
  const steps = [
    { id: 'connect', label: '连接', description: '品牌定制配置', icon: Package },
    { id: 'destination', label: '目的地', description: '选择发货目的地', icon: MapPin },
    { id: 'review', label: '重述', description: '确认订单信息', icon: Check },
  ]

  // 品牌定制处理函数
  const handleBrandConnect = (_productId: string, brandType: keyof typeof brandConnections, brandItem: BrandItem) => {
    setBrandConnections(prev => ({
      ...prev,
      [brandType]: {
        connected: true,
        brandItemId: brandItem.id,
        brandItemName: brandItem.name,
      }
    }))
  }

  const handleBrandDisconnect = (_productId: string, brandType: keyof typeof brandConnections) => {
    setBrandConnections(prev => ({
      ...prev,
      [brandType]: { connected: false }
    }))
  }

  const handleBrandView = (brandItem: BrandItem) => {
    console.log('查看品牌项目:', brandItem)
    alert(`查看品牌项目: ${brandItem.name}`)
  }

  // 处理购买
  const handlePurchase = () => {
    console.log('购买产品:', {
      productId,
      destination: selectedDestination,
      quantity,
      notes,
      nonBulkPackaging,
      brandConnections
    })
    alert('您将在两天内收到报价')
  }

  // 处理上一步
  const handlePreviousStep = () => {
    const stepOrder: PurchaseStep[] = ['connect', 'destination', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  // 处理下一步
  const handleNextStep = () => {
    const stepOrder: PurchaseStep[] = ['connect', 'destination', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  // 处理步骤点击
  const handleStepClick = (_stepId: string, stepNumber: number) => {
    const stepOrder: PurchaseStep[] = ['connect', 'destination', 'review']
    const targetStep = stepOrder[stepNumber - 1] as PurchaseStep
    if (targetStep) {
      setCurrentStep(targetStep)
    }
  }

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const currentStepNumber = steps.findIndex(s => s.id === currentStep) + 1
    return (
      <div className="flex justify-center mb-8">
        <Stepper
          currentStep={currentStepNumber}
          steps={steps}
          orientation="horizontal"
          className="max-w-2xl"
          onStepClick={handleStepClick}
        />
      </div>
    )
  }

  // 渲染品牌定制部分
  const renderBrandCustomization = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          为您的产品打上品牌
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          使用 Dropsure, 您可以通过打印logo, 选择运输包装, 选择愿望卡或定制产品包装来轻松创建自己的品牌。这将帮助您提高客户忠诚度和定期订单率。
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h4 className="font-medium">检查此产品的当前连接</h4>
          <div className="space-y-3">
            {[
              { key: 'logo', label: 'Logo', icon: Package },
              { key: 'card', label: '心愿卡', icon: CreditCard },
              { key: 'shippingPackaging', label: '运输包装', icon: Truck },
              { key: 'productPackaging', label: '产品包装', icon: Package },
            ].map(({ key, label, icon: Icon }) => {
              const connection = brandConnections[key as keyof typeof brandConnections]
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      connection.connected ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {connection.connected ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : (
                        <span className="text-white text-xs">×</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsBrandCustomizationOpen(true)}
                    >
                      详细信息
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // 渲染目的地选择
  const renderDestinationSelection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>选择您要将货物运送到的目的地?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedDestination === destination.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedDestination(destination.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{destination.flag}</span>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{destination.name}</h3>
                  <p className="text-sm text-muted-foreground">{destination.description}</p>
                </div>
                {selectedDestination === destination.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  // 渲染报价摘要
  const renderQuoteSummary = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>报价摘要</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">White / Wood</span>
              <Badge variant="outline">RQE65-001</Badge>
            </div>
            <p className="text-sm text-muted-foreground">重量: 10.976 kg</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm">数量:</span>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 h-8"
                min="1"
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>估计总数:</span>
            <span className="font-bold">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>数量:</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>目的地:</span>
            <span>{destinations.find(d => d.id === selectedDestination)?.name || '未选择'}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>产品类型:</span>
            <span>change</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="notes">Write Your Notes Here</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="输入您的备注..."
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="non-bulk"
              checked={nonBulkPackaging}
              onCheckedChange={(checked) => setNonBulkPackaging(checked as boolean)}
            />
            <Label htmlFor="non-bulk">非散装包装:</Label>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          size="lg"
          onClick={handlePurchase}
          disabled={!selectedDestination}
        >
          Buy Now
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          您将在两天内收到报价
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 返回按钮 */}
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

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">购买</h1>
      </div>

      {/* 步骤指示器 */}
      {renderStepIndicator()}

      {/* 主内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧内容 */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 'connect' && renderBrandCustomization()}
          {currentStep === 'destination' && renderDestinationSelection()}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {renderBrandCustomization()}
              {renderDestinationSelection()}
            </div>
          )}
        </div>

        {/* 右侧报价摘要 */}
        <div className="lg:col-span-1">
          {renderQuoteSummary()}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep !== 'connect' && (
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              上一步
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {currentStep === 'connect' && (
            <Button onClick={handleNextStep}>
              下一步
            </Button>
          )}
          {currentStep === 'destination' && (
            <Button onClick={handleNextStep} disabled={!selectedDestination}>
              下一步
            </Button>
          )}
          {currentStep === 'review' && (
            <Button onClick={handlePurchase} disabled={!selectedDestination}>
              完成购买
            </Button>
          )}
        </div>
      </div>

      {/* 品牌定制对话框 */}
      <BrandCustomizationDialog
        open={isBrandCustomizationOpen}
        onOpenChange={setIsBrandCustomizationOpen}
        productConnection={{
          id: product.id,
          productImage: product.image,
          productName: product.name,
          price: product.price,
          shippingFrom: 'beijing',
          shippingMethod: 'ds-economy-uk',
          shippingCost: 3.07,
          totalAmount: product.price + 3.07,
          brandConnections,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        onConnect={handleBrandConnect}
        onDisconnect={handleBrandDisconnect}
        onView={handleBrandView}
      />
    </div>
  )
}
