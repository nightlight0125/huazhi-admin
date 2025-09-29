import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Quote,
  ShoppingBag,
  Store,
  ShoppingCart,
  Wallet,
  Link,
  Palette,
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
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '询价管理',
          url: '/quotes',
          icon: Quote,
        },
        {
          title: '产品中心',
          url: '/products',
          icon: ShoppingBag,
        },
        {
          title: '产品连接',
          url: '/product-connections',
          icon: Link,
        },
        {
          title: '品牌管理',
          url: '/brands',
          icon: Palette,
        },
        {
          title: '店铺管理',
          url: '/stores',
          icon: Store,
        },
        {
          title: '订单管理',
          url: '/orders',
          icon: ShoppingCart,
        },
        {
          title: '钱包管理',
          url: '/wallet',
          icon: Wallet,
        },
        {
          title: '账号管理',
          url: '/users',
          icon: Users,
        },
        {
          title: '角色管理',
          url: '/roles',
          icon: ShieldCheck,
        },
      ],
    },
    // {
    //   title: 'Pages',
    //   items: [
    //     {
    //       title: 'Auth',
    //       icon: ShieldCheck,
    //       items: [
    //         {
    //           title: 'Sign In',
    //           url: '/sign-in',
    //         },
    //         {
    //           title: 'Sign In (2 Col)',
    //           url: '/sign-in-2',
    //         },
    //         {
    //           title: 'Sign Up',
    //           url: '/sign-up',
    //         },
    //         {
    //           title: 'Forgot Password',
    //           url: '/forgot-password',
    //         },
    //         {
    //           title: 'OTP',
    //           url: '/otp',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Errors',
    //       icon: Bug,
    //       items: [
    //         {
    //           title: 'Unauthorized',
    //           url: '/errors/unauthorized',
    //           icon: Lock,
    //         },
    //         {
    //           title: 'Forbidden',
    //           url: '/errors/forbidden',
    //           icon: UserX,
    //         },
    //         {
    //           title: 'Not Found',
    //           url: '/errors/not-found',
    //           icon: FileX,
    //         },
    //         {
    //           title: 'Internal Server Error',
    //           url: '/errors/internal-server-error',
    //           icon: ServerOff,
    //         },
    //         {
    //           title: 'Maintenance Error',
    //           url: '/errors/maintenance-error',
    //           icon: Construction,
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   title: 'Other',
    //   items: [
    //     {
    //       title: 'Settings',
    //       icon: Settings,
    //       items: [
    //         {
    //           title: 'Profile',
    //           url: '/settings',
    //           icon: UserCog,
    //         },
    //         {
    //           title: 'Account',
    //           url: '/settings/account',
    //           icon: Wrench,
    //         },
    //         {
    //           title: 'Appearance',
    //           url: '/settings/appearance',
    //           icon: Palette,
    //         },
    //         {
    //           title: 'Notifications',
    //           url: '/settings/notifications',
    //           icon: Bell,
    //         },
    //         {
    //           title: 'Display',
    //           url: '/settings/display',
    //           icon: Monitor,
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Help Center',
    //       url: '/help-center',
    //       icon: HelpCircle,
    //     },
    //   ],
    // },
  ],
}
