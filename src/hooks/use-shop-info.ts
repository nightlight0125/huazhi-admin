import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useShopStore } from '@/stores/shop-store'

/**
 * Hook to fetch and access shop information
 * Automatically uses the current user's id from auth store
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shopInfo, isLoading, error, refetch } = useShopInfo()
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *   
 *   return <div>Shop: {shopInfo?.name}</div>
 * }
 * ```
 */
export function useShopInfo() {
  const { auth } = useAuthStore()
  const { shop } = useShopStore()
  const userId = auth.user?.id

  // 自动获取店铺信息
  useEffect(() => {
    if (userId && !shop.shopInfo && !shop.isLoading) {
      shop.fetchShopInfo()
    }
  }, [userId, shop.shopInfo, shop.isLoading, shop])

  // 手动刷新店铺信息
  const refetch = () => {
    if (userId) {
      shop.fetchShopInfo()
    }
  }

  return {
    shopInfo: shop.shopInfo,
    isLoading: shop.isLoading,
    error: shop.error,
    refetch,
  }
}

