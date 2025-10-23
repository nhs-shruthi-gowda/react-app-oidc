import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 8000,
        open: true,
        proxy: {
            '/.well-known': {
                target: 'http://localhost:9400',
                changeOrigin: true,
                secure: false,
            },
            '/oauth2': {
                target: 'http://localhost:9400',
                changeOrigin: true,
                secure: false,
            },
            '/authorize': {
                target: 'http://localhost:9400',
                changeOrigin: true,
                secure: false,
            },
            '/token': {
                target: 'http://localhost:9400',
                changeOrigin: true,
                secure: false,
            },
            '/userinfo': {
                target: 'http://localhost:9400',
                changeOrigin: true,
                secure: false,
            },
            '/jwks': {
                target: 'http://localhost:9400',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
