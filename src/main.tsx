import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import 'flag-icons/css/flag-icons.min.css'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

const toastErrorOriginal = toast.error.bind(toast)
toast.error = ((...args: Parameters<typeof toast.error>) => {
  if (useAuthStore.getState().signingOut) {
    return '' as ReturnType<typeof toast.error>
  }
  return toastErrorOriginal(...args)
}) as typeof toast.error
// Styles
import { redirectToExpiredIfNeeded } from '@/lib/build-expiration'
import { handleServerError } from '@/lib/handle-server-error'
import {
  ensureShopifyAppBridgeScriptLoaded,
  initShopifyAppBridge,
} from '@/lib/shopify-app-bridge'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
// Generated Routes
import { routeTree } from './routeTree.gen'
import './styles/index.css'

try {
  await ensureShopifyAppBridgeScriptLoaded()
} catch (e) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('[Shopify App Bridge] script load skipped or failed', e)
  }
}
initShopifyAppBridge()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        if (useAuthStore.getState().signingOut) {
          return
        }
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (useAuthStore.getState().signingOut) {
        return
      }
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          router.navigate({ to: '/500' })
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function initExpirationGuards() {
  if (typeof window === 'undefined') return

  // Periodic check so an already-open page is blocked shortly after expiry.
  window.setInterval(() => {
    void redirectToExpiredIfNeeded()
  }, 3000)

  // Intercept user interactions: once expired, any click redirects to /500.
  document.addEventListener(
    'click',
    (event) => {
      if (redirectToExpiredIfNeeded()) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    true
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  initExpirationGuards()
  if (redirectToExpiredIfNeeded()) {
    // Build has expired, redirect handled above.
  } else {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <RouterProvider router={router} />
              </DirectionProvider>
            </FontProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </StrictMode>
    )
  }
}
