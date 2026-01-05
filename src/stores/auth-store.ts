import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { create } from 'zustand'
import { type RoleItem } from '@/lib/api/users'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const ROLES_STORAGE_KEY = 'roles_storage'
const USER_STORAGE_KEY = 'user_storage'
const TOKEN_EXPIRY_KEY = 'token_expiry'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
  id: string
  username: string
  roleId?: string
  hzkj_whatsapp1?: string
  phone?: string,
  customerId?: string,
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
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
  
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          // 同时保存到 localStorage
          if (user) {
            try {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
              // 保存 token 过期时间（3小时后）
              const expiryTime = Date.now() + 3 * 60 * 60 * 1000 // 3小时
              localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime))
            } catch (error) {
              console.warn('Failed to save user to localStorage:', error)
            }
          } else {
            localStorage.removeItem(USER_STORAGE_KEY)
            localStorage.removeItem(TOKEN_EXPIRY_KEY)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          localStorage.removeItem(TOKEN_EXPIRY_KEY)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          localStorage.removeItem(ROLES_STORAGE_KEY)
          localStorage.removeItem(USER_STORAGE_KEY)
          localStorage.removeItem(TOKEN_EXPIRY_KEY)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', roles: [] },
          }
        }),
      roles: initRoles,
      setRoles: (roles) =>
        set((state) => {
          // 同时保存到 localStorage
          try {
            localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
          } catch (error) {
            console.warn('Failed to save roles to localStorage:', error)
          }
          return { ...state, auth: { ...state.auth, roles } }
        }),
    },
  }
})
