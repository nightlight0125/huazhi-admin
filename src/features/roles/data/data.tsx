import { faker } from '@faker-js/faker'
import { Shield, UserCheck, Users, CreditCard } from 'lucide-react'
import { type Role } from './schema'

export const roleIcons = {
  superadmin: Shield,
  admin: UserCheck,
  manager: Users,
  cashier: CreditCard,
} as const

export const permissions = [
  { label: '用户管理', value: 'user_management' },
  { label: '角色管理', value: 'role_management' },
  { label: '系统设置', value: 'system_settings' },
  { label: '数据查看', value: 'data_view' },
  { label: '数据编辑', value: 'data_edit' },
  { label: '数据删除', value: 'data_delete' },
  { label: '报表查看', value: 'report_view' },
  { label: '系统监控', value: 'system_monitor' },
] as const

export const roles: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    value: 'superadmin',
    description: '拥有系统所有权限，可以管理所有用户和角色',
    permissions: ['user_management', 'role_management', 'system_settings', 'data_view', 'data_edit', 'data_delete', 'report_view', 'system_monitor'],
    userCount: faker.number.int({ min: 1, max: 5 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    id: '2',
    name: '管理员',
    value: 'admin',
    description: '可以管理用户和查看系统数据，但不能修改系统设置',
    permissions: ['user_management', 'data_view', 'data_edit', 'report_view'],
    userCount: faker.number.int({ min: 2, max: 10 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    id: '3',
    name: '经理',
    value: 'manager',
    description: '可以查看和编辑业务数据，管理团队用户',
    permissions: ['data_view', 'data_edit', 'report_view'],
    userCount: faker.number.int({ min: 5, max: 20 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    id: '4',
    name: '收银员',
    value: 'cashier',
    description: '只能查看和编辑收银相关数据',
    permissions: ['data_view', 'data_edit'],
    userCount: faker.number.int({ min: 10, max: 50 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
]
