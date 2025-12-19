'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { addAccount, queryRole, type RoleItem } from '@/lib/api/users'
import { encryptPassword } from '@/lib/crypto-utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { type User } from '../data/schema'

const formSchema = z
  .object({
    name: z.string().min(1, 'First name is required'),
    surname: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),
    password: z.string().transform((pwd) => pwd.trim()),
    roleId: z.string().min(1, 'Role is required'),
    customerId: z.string().optional(),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 0
    },
    {
      message: 'Password must be at least 0 characters',
      path: ['password'],
    }
  )

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { auth } = useAuthStore()
  const isEdit = !!currentRow

  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      if (!open) return // 只在对话框打开时获取

      setIsLoadingRoles(true)
      try {
        const roleList = await queryRole(1, 100) // 获取前100个角色
        setRoles(roleList)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
        toast.error('Failed to load roles. Please try again.')
      } finally {
        setIsLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [open])

  // 将角色数据转换为下拉选项格式
  const roleOptions = roles.map((role) => ({
    label: role.name || role.number || role.id,
    value: role.id,
  }))

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.firstName || '',
          surname: currentRow.lastName || '',
          username: currentRow.username || '',
          email: currentRow.email || '',
          phone: currentRow.phoneNumber || '',
          roleId: currentRow.role || '',
          password: '',
          customerId: '',
          isEdit,
        }
      : {
          name: '',
          surname: '',
          username: '',
          email: '',
          phone: '',
          roleId: '',
          password: '',
          customerId: '',
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    if (isEdit) {
      // TODO: 实现编辑用户的逻辑
      toast.info('Edit functionality is not implemented yet')
      return
    }

    // 获取当前登录用户的 id 作为 customerId
    const currentUserId = auth.user?.id
    if (!currentUserId) {
      toast.error('User not authenticated. Please login again.')
      return
    }

    // 验证必填字段
    if (!values.roleId) {
      toast.error('Please select a role')
      return
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading('Creating user...')

    try {
      // 加密密码
      const encryptedPassword = encryptPassword(values.password)

      // 调用添加账户 API
      await addAccount({
        username: values.username,
        email: values.email,
        surname: values.surname,
        name: values.name,
        phone: values.phone,
        password: encryptedPassword,
        roleId: Number(values.roleId),
        customerId: Number(currentUserId),
      })

      toast.dismiss(loadingToast)
      toast.success('User created successfully!')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create user. Please try again.'
      toast.error(errorMessage)
      console.error('Create user error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the user information.'
              : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter first name'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='surname'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Surname
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter last name'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter username'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='user@example.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter phone number'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roleId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder={
                          isLoadingRoles ? 'Loading roles...' : 'Select role'
                        }
                        className='col-span-4'
                        disabled={isLoadingRoles}
                        items={roleOptions}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='Enter password (min. 8 characters)'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isSubmitting}>
            {isSubmitting
              ? 'Creating...'
              : isEdit
                ? 'Save Changes'
                : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
