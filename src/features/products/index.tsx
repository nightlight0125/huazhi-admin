import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/header-actions'
import { type ProductCategory } from './components/products-category-tabs'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsGridTable } from './components/products-grid-table'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'
import { products } from './data/data'

export function Products() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeCategory, _setActiveCategory] =
    useState<ProductCategory>('public')

  // 根据分类过滤数据
  const filteredProducts = products.filter((product) => {
    switch (activeCategory) {
      case 'public':
        return product.isPublic === true
      case 'recommended':
        return product.isRecommended === true
      case 'favorites':
        return product.isFavorite === true
      case 'my-store':
        return product.isMyStore === true
      default:
        return true
    }
  })

  // 渲染内容
  const renderContent = () => {
    switch (activeCategory) {
      case 'public':
      case 'recommended':
      case 'favorites':
        return (
          <ProductsGridTable
            data={filteredProducts}
            category={activeCategory}
          />
        )
      case 'my-store':
        return <ProductsTable data={filteredProducts} />
      default:
        return (
          <ProductsGridTable
            data={filteredProducts}
            category={activeCategory}
          />
        )
    }
  }

  return (
    <ProductsProvider>
      <Header fixed>
        {/* <Search /> */}
        <HeaderActions />
      </Header>

      <Main fluid>
        {/* <div className='mb-6 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>产品中心</h2>
            <p className='text-muted-foreground'>
              浏览和管理各类产品，发现优质商品
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div> */}

        {/* 分类标签页 */}
        {/* <div className='mb-6'>
          <ProductsCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div> */}

        {/* 内容区域 */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {renderContent()}
        </div>
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  )
}
