'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  addAccount,
  queryRole,
  updateAccountInfo,
  type RoleItem,
} from '@/lib/api/users'
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
import { useUsers } from './users-provider'

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
  const { onRefresh } = useUsers()
  const isEdit = !!currentRow

  useEffect(() => {
    const fetchRoles = async () => {
      if (!open) return

      setIsLoadingRoles(true)
      try {
        const roleList = await queryRole(1, 100)
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

  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }))

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.firstName || '',
          surname: currentRow.surname || currentRow.lastName || '',
          username: currentRow.username || '',
          email: currentRow.email || '',
          phone: currentRow.phoneNumber || '',
          roleId: currentRow.roleId || currentRow.role || '',
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
      console.log('values', values)

      if (!currentRow) {
        toast.error('User data is missing')
        return
      }

      setIsSubmitting(true)
      const loadingToast = toast.loading('Updating user...')

      try {
        const fullName = `${values.name} ${values.surname}`.trim()

        await updateAccountInfo({
          id: currentRow.id,
          name: fullName || values.username,
          hzkj_username: values.username,
          hzkj_surname: values.surname || values.name || '',
          hzkj_role_id: values.roleId || '',
        })

        toast.dismiss(loadingToast)
        toast.success('User updated successfully!')
        form.reset()
        onOpenChange(false)
        // 刷新用户列表
        onRefresh?.()
      } catch (error) {
        toast.dismiss(loadingToast)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update user. Please try again.'
        toast.error(errorMessage)
        console.error('Update user error:', error)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // 获取当前登录用户的 id 作为 customerId
    const currentUserId = auth.user?.customerId
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

    console.log('values.roleId', values.roleId)

    try {
      // const encryptedPassword = encryptPassword(values.password)
      await addAccount({
        username: values.username,
        email: values.email,
        surname: values.surname,
        name: values.name,
        phone: values.phone,
        password: values.password,
        roleId: values.roleId,
        customerId: currentUserId,
      })

      toast.dismiss(loadingToast)
      toast.success('User created successfully!')
      form.reset()
      onOpenChange(false)
      // 刷新用户列表
      onRefresh?.()
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
              {!isEdit && (
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
                          placeholder='Enter password (min. 6 characters)'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
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
