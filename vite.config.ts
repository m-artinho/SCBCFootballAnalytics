import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────────────────
// GitHub Pages base path.
// A project page is served from https://<user>.github.io/<repo>/, so the
// production build must use base '/<repo>/'. This is resolved automatically:
//   1. In GitHub Actions, GITHUB_REPOSITORY ("owner/repo") gives the repo name
//      — no manual edit needed.
//   2. Otherwise, BASE_PATH env var if set (e.g. for the `npm run deploy` CLI).
//   3. Otherwise, the REPO_NAME fallback below (only used for a manual deploy
//      without Actions; safe to ignore if you deploy via Actions).
// For a user/org page (repo named <user>.github.io) set REPO_NAME = '' .
const REPO_NAME = 'REPLACE_WITH_REPO_NAME'
// ─────────────────────────────────────────────────────────────────────────

function resolveBase(command: string): string {
  if (command !== 'build') return '/' // dev server runs at root
  if (process.env.BASE_PATH) return process.env.BASE_PATH
  const ciRepo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (ciRepo) return `/${ciRepo}/`
  return REPO_NAME ? `/${REPO_NAME}/` : '/'
}

export default defineConfig(({ command }) => ({
  base: resolveBase(command),
  plugins: [react()],
}))
