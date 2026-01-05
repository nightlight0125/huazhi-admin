import { useAuthStore } from '@/stores/auth-store'
import { checkLoginStatus } from '@/lib/api/auth'

/**
 * 检查用户是否已认证（基于本地状态）
 * @returns 如果已认证返回 true，否则返回 false
 */
export function isAuthenticated(): boolean {
  const { auth } = useAuthStore.getState()
  return !!(auth.accessToken && auth.user?.id)
}

/**
 * 检查 token 是否过期（基于本地存储的过期时间）
 * @returns 如果过期返回 true，否则返回 false
 */
export function isTokenExpired(): boolean {
  try {
    const expiryTime = localStorage.getItem('token_expiry')
    if (!expiryTime) {
      // 如果没有过期时间，检查 user.exp
      const { auth } = useAuthStore.getState()
      if (auth.user?.exp) {
        return Date.now() >= auth.user.exp
      }
      // 如果都没有，认为已过期
      return true
    }
    return Date.now() >= Number(expiryTime)
  } catch {
    return true
  }
}

/**
 * 获取当前用户 ID（不抛出错误）
 * 推荐在组件中使用 useAuthStore hook 直接获取，更简洁
 * 
 * @deprecated 推荐直接使用 useAuthStore((state) => state.auth.user?.id)
 * 因为 API 拦截器已经做了全局认证检查，组件中不需要重复检查
 * 
 * @returns 用户ID，如果未认证返回 undefined
 */
export function getCurrentUserId(): string | undefined {
  const { auth } = useAuthStore.getState()
  return auth.user?.id
}

/**
 * 验证登录状态（调用后端 getUserStatus 接口检查）
 * 建议在应用启动时调用一次，或者在 token 即将过期时调用
 * 注意：这个接口会发送网络请求，不要在每个 API 请求前都调用
 * 
 * 使用场景：
 * 1. 应用启动时验证 token 是否仍然有效
 * 2. Token 即将过期时主动验证
 * 3. 页面刷新后验证登录状态
 * 
 * @returns Promise<boolean> 如果登录状态有效返回 true，否则返回 false
 */
export async function validateLoginStatus(): Promise<boolean> {
  try {
    // 先进行本地检查，避免不必要的网络请求
    if (!isAuthenticated() || isTokenExpired()) {
      return false
    }

    // 调用后端 getUserStatus 接口验证登录状态
    const result = await checkLoginStatus()
    
    if (!result.status) {
      // 如果后端返回登录状态无效，清除本地认证信息
      useAuthStore.getState().auth.reset()
      return false
    }

    return true
  } catch (error) {
    // 如果验证失败（如网络错误、401等），清除本地认证信息
    console.error('Login status validation failed:', error)
    useAuthStore.getState().auth.reset()
    return false
  }
}

