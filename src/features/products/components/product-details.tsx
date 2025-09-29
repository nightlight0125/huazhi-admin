import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Heart, Store, ShoppingCart, Tag, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { products } from '../data/data'
import { categories, locations } from '../data/data'
import { BrandCustomizationDialog } from '@/features/product-connections/components/brand-customization-dialog'
import { type BrandItem } from '@/features/brands/data/schema'

export function ProductDetails() {
  const { productId } = useParams({ from: '/_authenticated/products/$productId' })
  const navigate = useNavigate()
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState('')
  const [selectedFrom, setSelectedFrom] = useState('')
  const [selectedTo, setSelectedTo] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState('')
  const [isBrandCustomizationOpen, setIsBrandCustomizationOpen] = useState(false)

  // 查找产品数据
  const product = products.find(p => p.id === productId)
  
  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">产品未找到</h2>
          <p className="text-muted-foreground mb-4">请检查产品ID是否正确</p>
          <Button onClick={() => navigate({ to: '/products' })}>
            返回产品列表
          </Button>
        </div>
      </div>
    )
  }

  const category = categories.find(cat => cat.value === product.category)

  // 模拟产品变体数据
  const variations = [
    { id: 'wood', name: 'Wood', value: 'Wood' },
    { id: 'plastic', name: 'Plastic', value: 'Plastic' },
    { id: 'metal', name: 'Metal', value: 'Metal' },
  ]

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', value: 'standard' },
    { id: 'express', name: 'Express Shipping', value: 'express' },
    { id: 'overnight', name: 'Overnight Shipping', value: 'overnight' },
  ]

  // 模拟店铺数据
  const stores = [
    { id: 'store1', name: '我的主店铺', value: 'store1' },
    { id: 'store2', name: '精品店铺', value: 'store2' },
    { id: 'store3', name: '特价店铺', value: 'store3' },
  ]

  const totalPrice = product.price * selectedQuantity

  // 处理发布到店铺
  const handlePublishToStore = () => {
    if (!selectedStore) {
      alert('请选择一个店铺')
      return
    }
    
    const store = stores.find(s => s.value === selectedStore)
    console.log(`发布产品 ${product.name} 到店铺: ${store?.name}`)
    
    // 这里可以添加实际的发布逻辑
    alert(`产品已成功发布到 ${store?.name}`)
    setIsPublishDialogOpen(false)
    setSelectedStore('')
  }

  // 处理品牌定制
  const handleBrandConnect = (productId: string, brandType: keyof import('@/features/product-connections/data/schema').BrandConnection, brandItem: BrandItem) => {
    console.log('连接品牌:', productId, brandType, brandItem)
    // 这里可以添加实际的连接逻辑
    alert(`产品 ${productId} 已连接品牌项目: ${brandItem.name}`)
  }

  const handleBrandDisconnect = (productId: string, brandType: keyof import('@/features/product-connections/data/schema').BrandConnection) => {
    console.log('断开品牌连接:', productId, brandType)
    // 这里可以添加实际的断开连接逻辑
    alert(`产品 ${productId} 已断开品牌连接: ${brandType}`)
  }

  const handleBrandView = (brandItem: BrandItem) => {
    console.log('查看品牌项目:', brandItem)
    // 这里可以添加查看品牌项目的逻辑
    alert(`查看品牌项目: ${brandItem.name}`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/products' })}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回产品列表
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧：产品图片和详情 */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* 左侧：产品图片 */}
                <div className="flex flex-col">
                  {/* 主图片 */}
                  <div className="aspect-square overflow-hidden rounded-t-lg md:rounded-t-none md:rounded-l-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  {/* 缩略图轮播 */}
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {[product.image, product.image, product.image].map((img, index) => (
                        <div
                          key={index}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer hover:border-primary/80 transition-colors ${
                            selectedThumbnail === index ? 'border-primary' : 'border-gray-300'
                          }`}
                          onClick={() => setSelectedThumbnail(index)}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右侧：产品详情 */}
                <div className="p-6 border-l">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold line-clamp-3 mb-2">
                        {product.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>SKU: {product.sku}</span>
                        <Badge variant="outline">
                          {category?.label || product.category}
                        </Badge>
                      </div>
                    </div>

                    {/* 颜色款式 */}
                    <div>
                      <Label className="text-sm font-medium">颜色</Label>
                      <div className="flex gap-2 mt-2">
                        {[product.image, product.image, product.image].map((img, index) => (
                          <div
                            key={index}
                            className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer hover:border-primary/80 transition-colors ${
                              selectedColor === index ? 'border-primary' : 'border-gray-300'
                            }`}
                            onClick={() => setSelectedColor(index)}
                          >
                            <img
                              src={img}
                              alt={`${product.name} 款式 ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 主要材料 */}
                    <div>
                      <Label className="text-sm font-medium">主要材料</Label>
                      <div className="flex gap-2 mt-2">
                        {variations.map((variation) => (
                          <Button
                            key={variation.id}
                            variant={selectedVariation === variation.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedVariation(variation.value)}
                          >
                            {variation.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* 选项和数量 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">From</Label>
                        <Select value={selectedFrom} onValueChange={setSelectedFrom}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择发货地" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.value} value={location.value}>
                                <div className="flex items-center gap-2">
                                  {location.icon && <location.icon />}
                                  {location.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">To</Label>
                        <Select value={selectedTo} onValueChange={setSelectedTo}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择目的地" />
                          </SelectTrigger>
                          <SelectContent>
                            {shippingOptions.map((option) => (
                              <SelectItem key={option.id} value={option.value}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">数量</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：价格和操作 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>订单摘要</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 变体信息 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">变体</span>
                <span>{selectedVariation || 'Natural Wood'} / Wood</span>
              </div>

              {/* 价格信息 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">产品价格</span>
                  <span className="font-medium">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">运费</span>
                  <span className="font-medium">$0</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>总计</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Store className="h-4 w-4 mr-2" />
                      发布到店铺
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>发布到店铺</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="store-select">选择店铺</Label>
                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                          <SelectTrigger id="store-select">
                            <SelectValue placeholder="请选择要发布的店铺" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.value}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="text-sm font-medium">产品信息</div>
                        <div className="text-sm text-muted-foreground">
                          <div>产品名称: {product.name}</div>
                          <div>SKU: {product.sku}</div>
                          <div>价格: ${product.price.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => setIsPublishDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button 
                          className="flex-1" 
                          onClick={handlePublishToStore}
                          disabled={!selectedStore}
                        >
                          确认发布
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate({ to: `/products/${product.id}/purchase` })}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  立即购买
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => setIsBrandCustomizationOpen(true)}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  品牌定制
                </Button>
                
                <Button variant="outline" className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  添加到我的产品
                </Button>
              </div>

              {/* 喜欢按钮 */}
              <div className="pt-4">
                <Button variant="ghost" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  喜欢这个产品
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 产品描述 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>产品描述</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              多层设计：配备三个梯子和多个平台层，让小型动物可以奔跑、攀爬和玩耍，这个小型动物笼子是一个仓鼠游乐场豪宅。
              五层设置提供了充足的空间，让您的宠物可以自由活动，同时保持清洁和有序的环境。
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              高品质材料：采用天然木材制作，安全无毒，为您的宠物提供健康的生活环境。
              易于清洁的设计让日常维护变得简单，可拆卸的组件便于深度清洁。
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              多功能存储：底部配有储物架，可以存放宠物用品和食物，让您的生活空间更加整洁有序。
            </p>
          </div>
        </CardContent>
      </Card>

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
          brandConnections: {
            logo: { connected: false },
            card: { connected: false },
            productPackaging: { connected: false },
            shippingPackaging: { connected: false },
          },
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
