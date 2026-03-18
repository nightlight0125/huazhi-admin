import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import obfuscator from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    obfuscator({
      apply: 'build',
      exclude: [
        /[\\/]routes[\\/].*/, // 排除路由目录，避免破坏 TanStack Router 动态 import
        /tsr-split/, // 排除 TanStack Router 代码分割 chunk
        /[\\/]routeTree\.gen\.ts$/,
        /[\\/]routeTree\.ts$/,
      ],
      options: {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        identifierNamesGenerator: 'hexadecimal',
        rotateStringArray: true,
        selfDefending: false,
        shuffleStringArray: true,
        splitStrings: false,
        stringArray: true,
        stringArrayThreshold: 0.5,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      // 减少文件监听器的轮询间隔，避免频繁更新
      usePolling: false,
      // 忽略一些不必要的文件变化
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    // proxy: {
    //   '/api': {
    //     target: 'https://hyperzone.test.kdgalaxy.com',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // },
  },
})
