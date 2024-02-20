import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import libCss from 'vite-plugin-libcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), libCss()],
  build: {
    // lib: {
    //   // Could also be a dictionary or array of multiple entry points
    //   entry: resolve(__dirname, 'lib/main.js'),
    //   name: 'DiceRoller',
    //   // the proper extensions will be added
    //   fileName: 'dice-roller',
    // },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'tailwindcss'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
