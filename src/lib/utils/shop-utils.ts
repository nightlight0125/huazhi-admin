import { getUserShop, getUserShopList, type ShopListItem } from '@/lib/api/shop'
import { useAuthStore } from '@/stores/auth-store'
import type { ShopInfo } from '@/stores/shop-store'
import { useShopStore } from '@/stores/shop-store'

// 店铺选项类型
export interface ShopOption {
  value: string
  label: string
}

/**
 * 获取用户店铺列表并转换为选项格式
 * @param userId 用户ID
 * @param queryParam 查询参数，默认为 'w'
 * @param pageNo 页码，默认为 0
 * @param pageSize 每页数量，默认为 10
 * @returns 店铺选项数组，格式为 { value: shop.id, label: shop.name }
 */
export async function getUserShopOptions(
  userId: string,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ShopOption[]> {
  try {
    const response = await getUserShopList({
      hzkjAccountId: userId,
      pageNo,
      pageSize,
    })

    return response.list.map((shop: ShopListItem) => ({
      value: shop.id,
      label: shop.name || shop.platform || shop.id,
    }))
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    return []
  }
}

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

