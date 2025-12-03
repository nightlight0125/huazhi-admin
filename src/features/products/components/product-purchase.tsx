import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { products } from '../data/data'

export function ProductPurchase() {
  const { productId } = useParams({
    from: '/_authenticated/products/$productId/purchase',
  })
  const navigate = useNavigate()

  console.log('ProductPurchase component loaded, productId:', productId)

  // 状态管理

  // 产品变体选择状态
  const [selectedLightSource, setSelectedLightSource] = useState('christmas')
  const [selectedLightColor, setSelectedLightColor] = useState('white')
  const [selectedVariants, setSelectedVariants] = useState<
    Array<{
      id: string
      lightSource: string
      lightColor: string
      quantity: number
    }>
  >([
    { id: '1', lightSource: 'christmas', lightColor: 'white', quantity: 1 },
    { id: '2', lightSource: 'christmas', lightColor: 'black', quantity: 1 },
    { id: '3', lightSource: 'halloween', lightColor: 'white', quantity: 1 },
    { id: '4', lightSource: 'halloween', lightColor: 'black', quantity: 1 },
  ])

  // Buy Now：返回到上一级产品详情页
  const handleBuyNow = () => {
    navigate({ to: '..' })
  }

  // 查找产品数据
  const product = products.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold'>产品未找到</h2>
          <p className='text-muted-foreground mb-4'>
            请检查产品ID是否正确: {productId}
          </p>
          <Button onClick={() => navigate({ to: '/products' })}>
            返回产品列表
          </Button>
        </div>
      </div>
    )
  }

  // Note: The following render functions (renderBrandCustomization, renderDestinationSelection, renderQuoteSummary)
  // were removed as they are unused. They can be restored from version control if needed in the future.

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* 返回按钮 */}
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => navigate({ to: `/products/${productId}` })}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          return
        </Button>
      </div>

      {/* 页面标题 */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Add to Cart</h1>
      </div>

      {/* 产品详情 UI */}
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* 左侧：产品图片 */}
            <div>
              {/* 主图 */}
              <div className='aspect-square overflow-hidden rounded-lg border bg-gray-100'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='h-full w-full object-cover'
                />
              </div>
            </div>

            {/* 右侧：产品信息和选项 */}
            <div className='space-y-6'>
              {/* 产品标题、价格、SPU */}
              <div>
                <h2 className='mb-2 text-2xl font-bold'>{product.name}</h2>
                <div className='text-primary mb-2 text-3xl font-bold'>
                  ${product.price.toFixed(2)}
                </div>
                <div className='text-muted-foreground text-sm'>
                  SPU: {product.sku}
                </div>
              </div>

              {/* 产品选项 */}
              <div className='space-y-4'>
                {/* Power of light source */}
                <div>
                  <h3 className='mb-2 text-sm font-semibold'>
                    Power of light source
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      { id: 'christmas', label: 'Christmas pattern lights' },
                      { id: 'halloween', label: 'Halloween pattern light' },
                      { id: 'snowflake', label: 'Snowflake pattern light' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedLightSource(option.id)}
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                          selectedLightSource === option.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Light color */}
                <div>
                  <h3 className='mb-2 text-sm font-semibold'>Light color</h3>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      { id: 'white', label: 'White shell' },
                      { id: 'black', label: 'Black shell' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedLightColor(option.id)}
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                          selectedLightColor === option.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 已选变体列表 */}
              <div className='space-y-3 border-t pt-4'>
                <h3 className='text-sm font-semibold'>Selected Variants</h3>
                <div className='space-y-3'>
                  {selectedVariants.map((variant) => {
                    const displayName = `${variant.lightSource
                      .charAt(0)
                      .toUpperCase()}${variant.lightSource.slice(1)} pattern ${
                      variant.lightSource === 'christmas' ? 'lights' : 'light'
                    }-${variant.lightColor.charAt(0).toUpperCase()}${variant.lightColor.slice(1)} shell`
                    const sku = `${product.sku}-${displayName}`

                    return (
                      <div
                        key={variant.id}
                        className='flex items-center gap-3 rounded-lg border p-3'
                      >
                        <img
                          src={product.image}
                          alt={displayName}
                          className='h-16 w-16 rounded object-cover'
                        />
                        <div className='flex-1'>
                          <div className='mb-1 font-medium'>{displayName}</div>
                          <div className='text-muted-foreground mb-2 text-xs'>
                            SKU: {sku}
                          </div>
                          <div className='text-primary font-semibold'>
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => {
                              setSelectedVariants((prev) =>
                                prev.map((v) =>
                                  v.id === variant.id
                                    ? {
                                        ...v,
                                        quantity: Math.max(0, v.quantity - 1),
                                      }
                                    : v
                                )
                              )
                            }}
                            disabled={variant.quantity <= 0}
                          >
                            <Minus className='h-4 w-4' />
                          </Button>
                          <Input
                            type='number'
                            value={variant.quantity}
                            onChange={(e) => {
                              const newQuantity = Math.max(
                                0,
                                parseInt(e.target.value) || 0
                              )
                              setSelectedVariants((prev) =>
                                prev.map((v) =>
                                  v.id === variant.id
                                    ? { ...v, quantity: newQuantity }
                                    : v
                                )
                              )
                            }}
                            className='h-8 w-16 text-center'
                            min={0}
                          />
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => {
                              setSelectedVariants((prev) =>
                                prev.map((v) =>
                                  v.id === variant.id
                                    ? { ...v, quantity: v.quantity + 1 }
                                    : v
                                )
                              )
                            }}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 总价 */}
                <div className='border-t pt-3'>
                  <div className='flex justify-between text-lg font-semibold'>
                    <span>Total:</span>
                    <span className='text-primary'>
                      $
                      {(
                        selectedVariants.reduce(
                          (sum, v) => sum + v.quantity * product.price,
                          0
                        ) || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className='flex flex-wrap gap-3 pt-4'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='min-w-[120px] flex-1'
                  >
                    Go to Cart
                  </Button>
                  <Button size='lg' className='min-w-[120px] flex-1'>
                    Add to Cart
                  </Button>
                  <Button
                    size='lg'
                    className='min-w-[120px] flex-1'
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 步骤指示器 */}
      {/* {renderStepIndicator()} */}

      {/* 主内容区域 */}
      {/* <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          {currentStep === 'connect' && renderBrandCustomization()}
          {currentStep === 'destination' && renderDestinationSelection()}
          {currentStep === 'review' && (
            <div className='space-y-6'>
              {renderBrandCustomization()}
              {renderDestinationSelection()}
            </div>
          )}
        </div>

        <div className='lg:col-span-1'>{renderQuoteSummary()}</div>
      </div> */}

      {/* 底部导航 */}
      {/* <div className='mt-8 flex justify-between'>
        <div>
          {currentStep !== 'connect' && (
            <Button
              variant='outline'
              onClick={handlePreviousStep}
              className='flex items-center gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              上一步
            </Button>
          )}
        </div>

        <div className='flex gap-2'>
          {currentStep === 'connect' && (
            <Button onClick={handleNextStep}>下一步</Button>
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
      </div> */}

      {/* 品牌定制对话框 */}
      {/* <BrandCustomizationDialog
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
      /> */}
    </div>
  )
}
