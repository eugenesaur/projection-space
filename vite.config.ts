import { defineConfig } from 'vite'

// host: true — слушаем 0.0.0.0, иначе встроенный превью в IDE (прокси) часто не достукивается до 127.0.0.1
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
})
