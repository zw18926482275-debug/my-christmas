import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 🔴 核心修复：有了这一行，所有 404 报错都会消失
    base: '/my-christmas/',
    
    plugins: [react()],
    
    // 确保开发服务器也能跑
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // 你的 API Key 配置
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});
