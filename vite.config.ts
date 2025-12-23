import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 🔴 核心配置：让 GitHub Pages 能找到路径
    base: '/my-christmas/',
    
    plugins: [react()],
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // 环境变量配置 (保留你原来的 API Key 设置)
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // 通常这里指向 src
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});
