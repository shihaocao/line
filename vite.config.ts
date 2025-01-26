import { defineConfig } from 'vite';
import vercel from 'vite-plugin-vercel';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: process.env.PORT as unknown as number,
  },
  plugins: [
    vercel(),
    tailwindcss(),
  ],
});