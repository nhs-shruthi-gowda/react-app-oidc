import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 8000,
        open: true,
        fs: {
            // Allow serving files from the workspace root
            allow: [
                '/Users/shruthigowda/Projects/FTRS/oidc/react-app-react-oidc'
            ]
        },
        proxy: {
            // Proxy NHS Identity endpoints to avoid CORS
            '/openam': {
                target: 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443',
                changeOrigin: true,
                secure: false,
                rewrite: (path: string) => path,
            },
            '/.well-known': {
                target: 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443',
                changeOrigin: true,
                secure: false,
            },
            '/authorize': {
                target: 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare',
                changeOrigin: true,
                secure: false,
                rewrite: (path: string) => path.replace(/^\/authorize/, '/authorize'),
            },
            '/access_token': {
                target: 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare',
                changeOrigin: true,
                secure: false,
                rewrite: (path: string) => path.replace(/^\/access_token/, '/access_token'),
            },
            '/userinfo': {
                target: 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare',
                changeOrigin: true,
                secure: false,
                rewrite: (path: string) => path.replace(/^\/userinfo/, '/userinfo'),
            },
            '/connect': {
                target: 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
