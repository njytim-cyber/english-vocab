import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Vendor chunks - split out large libraries
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@supabase')) {
                            return 'vendor-supabase';
                        }
                    }
                    // Data chunks - large JSON files
                    if (id.includes('/data/') && id.endsWith('.json')) {
                        return 'data';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 600
    }
})
