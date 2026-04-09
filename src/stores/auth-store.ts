import { type RoleItem } from '@/lib/api/users'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { create } from 'zustand'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const ROLES_STORAGE_KEY = 'roles_storage'
const USER_STORAGE_KEY = 'user_storage'
/** 登录/刷新接口返回的 validateTime 解析后的过期时刻（ms），非敏感 */
const TOKEN_EXPIRES_AT_MS_KEY = 'token_expires_at_ms'
interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  id: string
  username: string
  roleId?: string
  hzkj_whatsapp1?: string
  phone?: string,
  customerId?: string,
}

interface AuthState {
  /** 用户主动退出登录流程中：用于屏蔽全局 toast / 查询错误提示 */
  signingOut: boolean
  setSigningOut: (value: boolean) => void
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    /** 当前 access token 过期时刻（毫秒），来自登录/刷新接口的 validateTime */
    tokenExpiresAtMs: number | null
    setTokenExpiresAtMs: (expiresAtMs: number | null) => void
    resetAccessToken: () => void
    reset: () => void
    roles: RoleItem[]
    setRoles: (roles: RoleItem[]) => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  // 从 localStorage 读取 user（如果存在）
  let initUser: AuthUser | null = null
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      initUser = JSON.parse(storedUser)
    }
  } catch (error) {
    console.warn('Failed to load user from localStorage:', error)
  }
  
  // 从 localStorage 读取 roles（如果存在）
  let initRoles: RoleItem[] = []
  try {
    const storedRoles = localStorage.getItem(ROLES_STORAGE_KEY)
    if (storedRoles) {
      initRoles = JSON.parse(storedRoles)
    }
  } catch (error) {
    console.warn('Failed to load roles from localStorage:', error)
  }

  let initTokenExpiresAtMs: number | null = null
  try {
    const raw = localStorage.getItem(TOKEN_EXPIRES_AT_MS_KEY)
    if (raw != null && raw !== '') {
      const n = Number(raw)
      if (Number.isFinite(n) && n > 0) initTokenExpiresAtMs = n
    }
  } catch {
    initTokenExpiresAtMs = null
  }

  return {
    signingOut: false,
    setSigningOut: (value) => set({ signingOut: value }),
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          // 同时保存到 localStorage
          if (user) {
            try {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
            } catch (error) {
            }
          } else {
            localStorage.removeItem(USER_STORAGE_KEY)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      tokenExpiresAtMs: initTokenExpiresAtMs,
      setTokenExpiresAtMs: (expiresAtMs) =>
        set((state) => {
          try {
            if (expiresAtMs != null && Number.isFinite(expiresAtMs)) {
              localStorage.setItem(TOKEN_EXPIRES_AT_MS_KEY, String(expiresAtMs))
            } else {
              localStorage.removeItem(TOKEN_EXPIRES_AT_MS_KEY)
            }
          } catch {
            // ignore
          }
          return {
            ...state,
            auth: { ...state.auth, tokenExpiresAtMs: expiresAtMs },
          }
        }),
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          try {
            localStorage.removeItem(TOKEN_EXPIRES_AT_MS_KEY)
          } catch {
            // ignore
          }
          return {
            ...state,
            auth: { ...state.auth, accessToken: '', tokenExpiresAtMs: null },
          }
        }),
      reset: () =>
        set((state) => {
          const currentUser = state.auth.user
          const customerId = currentUser?.customerId || currentUser?.id
          if (customerId) {
            try {
              const storageKey = `dashboard_reminder_shown_${customerId}`
              sessionStorage.removeItem(storageKey)
            } catch (error) {
            }
          }
          removeCookie(ACCESS_TOKEN)
          localStorage.removeItem(ROLES_STORAGE_KEY)
          localStorage.removeItem(USER_STORAGE_KEY)
          localStorage.removeItem('token_expiry')
          localStorage.removeItem(TOKEN_EXPIRES_AT_MS_KEY)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              tokenExpiresAtMs: null,
              roles: [],
            },
          }
        }),
      roles: initRoles,
      setRoles: (roles) =>
        set((state) => {
          // 同时保存到 localStorage
          try {
            localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
          } catch (error) {
          }
          return { ...state, auth: { ...state.auth, roles } }
        }),
    },
  }
})
