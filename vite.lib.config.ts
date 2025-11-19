import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  publicDir: false, // 라이브러리 빌드 시 public 폴더 무시
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GsapSlideCarousel',
      fileName: (format) => `gsap-slide-carousel.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['gsap'],
      output: {
        exports: 'named',
        globals: {
          'gsap': 'gsap'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'carousel.css';
          }
          return assetInfo.name || 'asset';
        }
      }
    },
    cssCodeSplit: false,
    outDir: 'dist/lib',
    emptyOutDir: false
  }
});
