import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Star, Heart, Store } from 'lucide-react'

export type ProductCategory = 'public' | 'recommended' | 'favorites' | 'my-store'

interface ProductsCategoryTabsProps {
  activeCategory: ProductCategory
  onCategoryChange: (category: ProductCategory) => void
}

export function ProductsCategoryTabs({ activeCategory, onCategoryChange }: ProductsCategoryTabsProps) {
  return (
    <Tabs value={activeCategory} onValueChange={(value) => onCategoryChange(value as ProductCategory)} className="w-fit">
      <TabsList className="grid w-fit grid-cols-4 gap-1 h-9">
        <TabsTrigger value="public" className="flex items-center gap-2 px-3 py-1.5 h-8 text-sm">
          <Package className="h-4 w-4" />
          公共目录
        </TabsTrigger>
        <TabsTrigger value="recommended" className="flex items-center gap-2 px-3 py-1.5 h-8 text-sm">
          <Star className="h-4 w-4" />
          推荐产品
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex items-center gap-2 px-3 py-1.5 h-8 text-sm">
          <Heart className="h-4 w-4" />
          喜欢的产品
        </TabsTrigger>
        <TabsTrigger value="my-store" className="flex items-center gap-2 px-3 py-1.5 h-8 text-sm">
          <Store className="h-4 w-4" />
          我的店铺产品
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
