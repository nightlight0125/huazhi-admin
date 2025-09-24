'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { permissions } from '../data/data'
import { type Role } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, '角色名称为必填项'),
  value: z.string().min(1, '角色标识为必填项'),
  description: z.string().min(1, '描述为必填项'),
  permissions: z.array(z.string()).min(1, '至少选择一个权限'),
  isEdit: z.boolean(),
})

type RoleForm = z.infer<typeof formSchema>

type RoleActionDialogProps = {
  currentRow?: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RoleActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          name: '',
          value: '',
          description: '',
          permissions: [],
          isEdit,
        },
  })

  const onSubmit = (values: RoleForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
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
          <DialogTitle>{isEdit ? '编辑角色' : '添加新角色'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '在此更新角色信息。' : '在此创建新角色。'}
            完成后点击保存。
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='role-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      角色名称
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='超级管理员'
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
                name='value'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      角色标识
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='superadmin'
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
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      描述
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='拥有系统所有权限，可以管理所有用户和角色'
                        className='col-span-4 resize-none'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='permissions'
                render={() => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end pt-2'>
                      权限
                    </FormLabel>
                    <FormControl>
                      <div className='col-span-4 space-y-2'>
                        {permissions.map((permission) => (
                          <FormField
                            key={permission.value}
                            control={form.control}
                            name='permissions'
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={permission.value}
                                  className='flex flex-row items-start space-x-3 space-y-0'
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, permission.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== permission.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className='text-sm font-normal'>
                                    {permission.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='role-form'>
            保存更改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
