import { create } from 'zustand'
import { getUserShop } from '@/lib/api/shop'
import { useAuthStore } from './auth-store'

// 店铺信息接口
export interface ShopInfo {
  id?: string
  name?: string
  platform?: string
  status?: string
  [key: string]: unknown
}

interface ShopState {
  shop: {
    shopInfo: ShopInfo | null
    isLoading: boolean
    error: string | null
    fetchShopInfo: (userId?: string) => Promise<void>
    setShopInfo: (shopInfo: ShopInfo | null) => void
    reset: () => void
  }
}

export const useShopStore = create<ShopState>()((set, get) => ({
  shop: {
    shopInfo: null,
    isLoading: false,
    error: null,
    fetchShopInfo: async (userId?: string) => {
      // 如果没有传入 userId，从 auth store 获取
      let targetUserId = userId
      if (!targetUserId) {
        const { auth } = useAuthStore.getState()
        targetUserId = auth.user?.id
      }

      if (!targetUserId) {
        set((state) => ({
          shop: {
            ...state.shop,
            error: 'User not authenticated',
            isLoading: false,
          },
        }))
        return
      }

      set((state) => ({
        shop: { ...state.shop, isLoading: true, error: null },
      }))

      try {
        const response = await getUserShop(targetUserId)

        // 根据实际 API 响应结构处理数据
        let shopData: ShopInfo | null = null

        if (response.data) {
          // 如果返回的是数组，取第一个
          if (Array.isArray(response.data)) {
            shopData = (response.data[0] as ShopInfo) || null
          }
          // 如果返回的是对象
          else if (typeof response.data === 'object') {
            shopData = response.data as ShopInfo
          }
        }

        set((state) => ({
          shop: {
            ...state.shop,
            shopInfo: shopData,
            isLoading: false,
            error: null,
          },
        }))
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to fetch shop information'
        console.error('获取店铺信息失败:', error)
        set((state) => ({
          shop: {
            ...state.shop,
            error: errorMessage,
            isLoading: false,
          },
        }))
      }
    },
    setShopInfo: (shopInfo) =>
      set((state) => ({
        shop: { ...state.shop, shopInfo },
      })),
    reset: () =>
      set({
        shop: {
          shopInfo: null,
          isLoading: false,
          error: null,
          fetchShopInfo: get().shop.fetchShopInfo,
          setShopInfo: get().shop.setShopInfo,
          reset: get().shop.reset,
        },
      }),
  },
}))

