import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        materials: fileURLToPath(new URL('./materi/index.html', import.meta.url)),
        gitGithub: fileURLToPath(new URL('./materi/git-github/index.html', import.meta.url)),
      },
    },
  },
});
