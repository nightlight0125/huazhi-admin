import { getUserShop } from '@/lib/api/shop'
import { useAuthStore } from '@/stores/auth-store'
import { useShopStore } from '@/stores/shop-store'
import type { ShopInfo } from '@/stores/shop-store'

/**
 * 获取当前用户的店铺信息
 * 自动使用当前登录用户的 id
 * 
 * @returns Promise<ShopInfo | null> 店铺信息，如果获取失败返回 null
 * 
 * @example
 * ```ts
 * // 在任何组件或函数中使用
 * const shopInfo = await getCurrentUserShopInfo()
 * if (shopInfo) {
 *   console.log('店铺名称:', shopInfo.name)
 * }
 * ```
 */
export async function getCurrentUserShopInfo(): Promise<ShopInfo | null> {
  const { auth } = useAuthStore.getState()
  const userId = auth.user?.id

  if (!userId) {
    console.warn('User not authenticated')
    return null
  }

  try {
    const response = await getUserShop(userId)

    // 根据实际 API 响应结构处理数据
    if (response.data) {
      // 如果返回的是数组，取第一个
      if (Array.isArray(response.data)) {
        return (response.data[0] as ShopInfo) || null
      }
      // 如果返回的是对象
      if (typeof response.data === 'object') {
        return response.data as ShopInfo
      }
    }

    return null
  } catch (error) {
    console.error('获取店铺信息失败:', error)
    return null
  }
}

/**
 * 使用 store 获取并缓存店铺信息
 * 推荐在组件中使用，会自动缓存结果
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const shopInfo = useShopInfoFromStore()
 *   
 *   return <div>{shopInfo?.name || 'No shop'}</div>
 * }
 * ```
 */
export function useShopInfoFromStore() {
  const { auth } = useAuthStore()
  const { shop } = useShopStore()
  const userId = auth.user?.id

  // 如果用户已登录且还没有店铺信息，自动获取
  if (userId && !shop.shopInfo && !shop.isLoading) {
    shop.fetchShopInfo()
  }

  return {
    shopInfo: shop.shopInfo,
    isLoading: shop.isLoading,
    error: shop.error,
    refetch: () => shop.fetchShopInfo(),
  }
}

