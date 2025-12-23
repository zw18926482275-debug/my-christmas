import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // ⚠️ 关键修改：填入你的 GitHub 仓库名称，前后都要加斜杠
      // 如果你的仓库链接是 https://github.com/你的用户名/merry-christmas
      // 这里就填 '/merry-christmas/'
      base: './',

      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 你原本的 polyfill 写法可以保留，但我建议改用 import.meta.env（见第三步）
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // 建议增加构建输出配置
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
      }
    };
});
