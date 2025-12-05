import {
  AudioWaveform,
  ChartColumnBig,
  ClipboardList,
  ClipboardMinus,
  GalleryVerticalEnd,
  House,
  LayoutGrid,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Wallet
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'nightlight',
    email: 'nightlight0125@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '华智 FOP',
      logo: "https://yinyan-mini.cn-heyuan.oss.aliyuncs.com/20251203/logo_1764749478049.png",
      plan: '企业版',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: '',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: House,
        },
        {
          title: 'Store Management',
          url: '/store-management',
          icon: Store,
        },
        {
          title: 'Find Products',
          icon: LayoutGrid,
          items: [
            {
              title: 'All Products',
              url: '/all-products',
            },
            {
              title: 'Winning Products  ',
              url: '/winning-products',
            },
            {
              title: 'Sourcing',
              url: '/sourcing',
            },
            {
              title: 'liked products',
              url: '/liked-products',
            },
            {
              title: 'collection products',
              url: '/collection-products',
            },
            {
              title: 'Recommend Products',
              url: '/recommend-products',
            },
          ],
        },
        {
          title: 'Store Products',
          icon: Package,
          items: [
            {
              title: 'Store Products',
              url: '/store-products',
            },
            {
              title: 'Published products',
              url: '/published-products',
            },
          ],
        },
        {
          title: 'Branding',
          icon: ShoppingBag,
          items: [
            {
              title: 'Packaging Products',
              url: '/packaging-products',
            },
            {
              title: 'Packaging Connection',
              url: '/packaging-connection',
            }
          ],
        },
        {
          title: 'Orders',
          icon: ClipboardList,
          items: [
            {
              title: 'Store Orders',
              url: '/orders',
            },
            {
              title: 'Sample Orders',
              url: '/sample-orders',
            },
            {
              title: 'Stock Orders',
              url: '/stock-orders',
            },
          ],
        },
        {
          title: 'My Inventory',
          url: '/my-inventory',
          icon: ChartColumnBig,
        },
        {
          title: 'Support Tickets',
          url: '/support-tickets',
          icon: Users,
        },
        {
          title: 'Affiliate Plan',
          url: '/affiliate-plan',
          icon: ClipboardMinus,
        },
        {
          title: 'Wallet',
          url: '/wallet',
          icon: Wallet,
        },
       
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Logistics',
              url: '/logistics',
            },
            {
              title: 'Accounts',
              url: '/users',
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
            },
            {
              title: 'Profile',
              url: '/settings',
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
            },
            {
              title: 'Display',
              url: '/settings/display',
            },
          ],
        }
      ],
    },
   
  ],
}
