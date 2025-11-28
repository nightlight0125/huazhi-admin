import {
  AudioWaveform,
  ChartColumnBig,
  ClipboardList,
  ClipboardMinus,
  Command,
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
      logo: Command,
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
        // {
        //   title: 'Tasks',
        //   url: '/tasks',
        // },
        // {
        //   title: 'apps',
        //   url: '/apps',
        // },
        // {
        //   title: 'stores',
        //   url: '/stores',
        // },
        // {
        //   title: 'wallet',
        //   url: '/wallet',
        // },
        // {
        //   title: 'auth',
        //   url: '/auth',
        // },
        // {
        //   title: 'chats',
        //   url: '/chats',
        // },
        // {
        //   title: 'brands',
        //   url: '/brands',
        // },
        // {
        //   title: 'quotes',
        //   url: '/quotes',
        // },
        // {
        //   title: 'roles',
        //   url: '/roles',
        // },
        // {
        //   title: 'Users',
        //   url: '/users',
        //   icon: Users,
        // },
        // {
        //   title: 'settings',
        //   url: '/settings',
        // },
        // {
        //   title: 'Order',
        //   url: '/orders',
        //   icon: ClipboardList,
        // },
        // {
        //   title: 'Order',
        //   url: '/orders',
        //   icon: ClipboardList,
        // },

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
              title: 'Liked Products',
              url: '/liked-products',
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
            // {
            //   title: 'Bundle Products',
            //   url: '/bundle-products',
            // },
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
        // {
        //   title: 'Cart',
        //   url: '/cart',
        //   icon: ShoppingCart,
        // },
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
        // {
        //   title: 'POD',
        //   icon: CircleParking,
        //   items: [
        //     {
        //       title: 'POD Products',
        //       url: '/pod-products',
        //     },
        //     {
        //       title: 'POD Design',
        //       url: '/pod-design',
        //     },
        //     {
        //       title: 'POD Publish',
        //       url: '/pod-publish',
        //     },
        //   ],
        // },
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
              title: 'Profile',
              url: '/settings',
            },
            {
              title: 'Logistics',
              url: '/logistics',
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
            },
            {
              title: 'Accounts',
              url: '/users',
            },
          ],
        }
      ],
    },
   
  ],
}
