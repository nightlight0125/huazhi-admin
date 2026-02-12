import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { shopifyCallback, shopifyOAuth } from '@/lib/api/shop'
import { useAuthStore } from '@/stores/auth-store'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ConnectStoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platformName: string
  onNext: () => void
}

export function ConnectStoreDialog({
  open,
  onOpenChange,
  platformName,
  onNext,
}: ConnectStoreDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const user = useAuthStore((state) => state.auth.user)

  // 处理 OAuth 回调
  const handleCallback = useCallback(
    async (code: string, shop: string, state: string) => {
      try {
        setIsLoading(true)

        // 调用回调接口
        await shopifyCallback(code, shop, state)

        toast.success('Store connected successfully!')
        onNext()
        onOpenChange(false)
      } catch (error) {
        console.error('Callback error:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to complete OAuth. Please try again.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [onNext, onOpenChange]
  )

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleNext = async () => {
    if (platformName !== 'Shopify') {
      onNext()
      onOpenChange(false)
      return
    }

    if (!user?.id) {
      toast.error('User ID not found. Please login again.')
      return
    }

    setIsLoading(true)

    try {
      const shop = 'wlsstore4.myshopify.com'
      const state = user.id

      // 1. 获取 OAuth URL
      const oauthUrl = await shopifyOAuth(shop, state)
      console.log('OAuth URL:', oauthUrl)

      // 2. 打开 OAuth URL（新窗口）
      const authWindow = window.open(
        oauthUrl,
        'Shopify OAuth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!authWindow) {
        throw new Error('Failed to open OAuth window. Please allow popups.')
      }

      // 3. 监听窗口关闭或消息，获取 code
      const checkAuthWindow = setInterval(() => {
        try {
          // 检查窗口是否已关闭
          if (authWindow.closed) {
            clearInterval(checkAuthWindow)
            setIsLoading(false)
            // 如果窗口关闭但没有收到回调，可能是用户取消了授权
            toast.info('OAuth process cancelled or completed')
            return
          }

          // 尝试从窗口 URL 中直接获取 code（仅当与当前页面同源时才可行）
          const href = authWindow.location.href

          // 只有在同源情况下，浏览器才允许我们读取 authWindow.location
          if (href && href.startsWith(window.location.origin)) {
            const url = new URL(href)
            const codeFromUrl = url.searchParams.get('code')
            const shopFromUrl = url.searchParams.get('shop')
            const stateFromUrl = url.searchParams.get('state')

            console.log('codeFromUrl:', codeFromUrl)
            console.log('shopFromUrl:', shopFromUrl)
            console.log('stateFromUrl:', stateFromUrl)  

            if (codeFromUrl && shopFromUrl && stateFromUrl === state) {
              clearInterval(checkAuthWindow)
              setIsLoading(false)

              // 关闭监听并关闭窗口
              window.removeEventListener('message', messageHandler)
              authWindow.close()

              // 调用回调逻辑
              handleCallback(codeFromUrl, shopFromUrl, stateFromUrl)
            }
          }
        } catch (error) {
          // 跨域访问会失败，这是正常的
        }
      }, 1000)

      // 4. 监听来自 OAuth 窗口的消息（如果使用 postMessage）
      const messageHandler = (event: MessageEvent) => {
        // 验证消息来源（安全考虑）
        if (event.origin !== window.location.origin) {
          return
        }

        if (event.data.type === 'shopify-oauth-callback') {
          const { code } = event.data
          if (code) {
            clearInterval(checkAuthWindow)
            window.removeEventListener('message', messageHandler)
            authWindow.close()
            handleCallback(code, shop, state)
          }
        }
      }

      window.addEventListener('message', messageHandler)

      // 5. 设置超时
      setTimeout(() => {
        clearInterval(checkAuthWindow)
        window.removeEventListener('message', messageHandler)
        if (!authWindow.closed) {
          authWindow.close()
          setIsLoading(false)
          toast.error('OAuth timeout. Please try again.')
        }
      }, 300000) // 5 分钟超时
    } catch (error) {
      console.error('OAuth error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to start OAuth process. Please try again.'
      )
      setIsLoading(false)
    }
  }

  // 检查 URL 参数中是否有 code（如果是从回调页面返回的）
  useEffect(() => {
    if (!open || platformName !== 'Shopify' || !user?.id) {
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const shop = urlParams.get('shop')
    const state = urlParams.get('state')

    if (code && shop && state && user.id === state) {
      // 清除 URL 参数
      window.history.replaceState({}, '', window.location.pathname)
      handleCallback(code, shop, state)
    }
  }, [open, platformName, user?.id, handleCallback])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Connect Store</DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-muted-foreground text-sm'>
            Connect with {platformName} store
          </p>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
