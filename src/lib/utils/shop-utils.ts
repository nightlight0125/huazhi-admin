import { getUserShop } from '@/lib/api/shop'
import { useAuthStore } from '@/stores/auth-store'
import type { ShopInfo } from '@/stores/shop-store'
import { useShopStore } from '@/stores/shop-store'


export async function getCurrentUserShopInfo(): Promise<ShopInfo | null> {
  const { auth } = useAuthStore.getState()
  const userId = auth.user?.id
  if (!userId) {
    return null
  }
  try {
    const response = await getUserShop(userId)

    if (response.data) {
      if (Array.isArray(response.data)) {
        return (response.data[0] as ShopInfo) || null
      }
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


export function useShopInfoFromStore() {
  const { auth } = useAuthStore()
  const { shop } = useShopStore()
  const userId = auth.user?.id

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

