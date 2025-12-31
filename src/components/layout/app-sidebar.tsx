import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { queryMenu, type MenuPermissionItem } from '@/lib/api/users'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import {
  type NavCollapsible,
  type NavGroup as NavGroupProps,
  type NavItem,
  type NavLink,
} from './types'

// 根据 roleId 和菜单权限判断是否应该显示某个路由
function shouldShowRoute(
  url: string | unknown,
  roleId?: string,
  menuPermissions?: MenuPermissionItem[]
): boolean {
  if (!roleId) return true // 如果没有 roleId，显示所有菜单

  // 将 URL 转换为字符串并规范化（移除尾部斜杠）
  const normalizedUrl =
    typeof url === 'string' ? url.replace(/\/$/, '') : String(url)

  // 如果从接口获取了菜单权限，优先使用接口数据
  if (menuPermissions && menuPermissions.length > 0) {
    // 检查菜单权限中是否包含该路由
    // 假设菜单权限数据中有 url 字段，需要根据实际返回的数据结构调整
    const hasPermission = menuPermissions.some((menu) => {
      const menuUrl = menu.url || menu.menuId || ''
      return (
        menuUrl === normalizedUrl ||
        normalizedUrl.startsWith(menuUrl + '/') ||
        menuUrl === normalizedUrl + '/'
      )
    })
    return hasPermission
  }

  // 如果没有从接口获取到权限，使用硬编码规则作为后备方案
  // 2335629944731778048: 展示全部菜单
  if (roleId === '2335629944731778048') {
    return true
  }

  // 2335630403169209344: 除了 /users 不展示，其他都展示
  if (roleId === '2335630403169209344') {
    return normalizedUrl !== '/users' && !normalizedUrl.startsWith('/users/')
  }

  // 2336649784313560064: 除了 /users 不展示，其他都展示
  if (roleId === '2336649784313560064') {
    return normalizedUrl !== '/users' && !normalizedUrl.startsWith('/users/')
  }

  // 2336649944812839936: 只展示 /wallet 路由
  if (roleId === '2336649944812839936') {
    return normalizedUrl === '/wallet' || normalizedUrl.startsWith('/wallet/')
  }

  // 默认显示所有菜单
  return true
}

// 过滤菜单项
function filterNavItem(
  item: NavItem,
  roleId?: string,
  menuPermissions?: MenuPermissionItem[]
): NavItem | null {
  // 如果是链接类型
  if ('url' in item && !('items' in item)) {
    const navLink = item as NavLink
    return shouldShowRoute(navLink.url, roleId, menuPermissions)
      ? navLink
      : null
  }

  // 如果是可折叠类型
  if ('items' in item) {
    const navCollapsible = item as NavCollapsible
    // 过滤子菜单项
    const filteredItems = navCollapsible.items
      .map((subItem) => {
        return shouldShowRoute(subItem.url, roleId, menuPermissions)
          ? subItem
          : null
      })
      .filter((item): item is NavLink => item !== null)

    // 如果所有子菜单都被过滤掉了，则不显示这个父菜单
    if (filteredItems.length === 0) {
      return null
    }

    return {
      ...navCollapsible,
      items: filteredItems,
    }
  }

  return item
}

// 过滤菜单组
function filterNavGroups(
  navGroups: NavGroupProps[],
  roleId?: string,
  menuPermissions?: MenuPermissionItem[]
): NavGroupProps[] {
  return navGroups
    .map((group) => {
      const filteredItems = group.items
        .map((item) => filterNavItem(item, roleId, menuPermissions))
        .filter((item): item is NavItem => item !== null)

      if (filteredItems.length === 0) {
        return null
      }

      return {
        ...group,
        items: filteredItems,
      }
    })
    .filter((group): group is NavGroupProps => group !== null)
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { auth } = useAuthStore()
  const roleId = auth.user?.roleId
  const [menuPermissions, setMenuPermissions] = useState<MenuPermissionItem[]>(
    []
  )

  useEffect(() => {
    const fetchMenuPermissions = async () => {
      if (!roleId) {
        setMenuPermissions([])
        return
      }

      try {
        const permissions = await queryMenu(roleId)
        setMenuPermissions(permissions)
      } catch (error) {
        setMenuPermissions([])
      }
    }

    fetchMenuPermissions()
  }, [roleId])

  const filteredNavGroups = useMemo(() => {
    return filterNavGroups(sidebarData.navGroups, roleId, menuPermissions)
  }, [roleId, menuPermissions])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader className='pb-1'>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent className='gap-0'>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className='pb-1'>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
