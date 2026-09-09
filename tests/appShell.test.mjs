import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')

test('Next does not force immutable caching for development assets', async () => {
  const config = await readSource('next.config.js')

  assert.doesNotMatch(config, /source:\s*['"]\/_next\/static\/:path\*['"]/)
  assert.doesNotMatch(config, /max-age=31536000,\s*immutable/)
})

test('the authenticated app shell renders shared controls only through TopNavbar', async () => {
  const app = await readSource('src/pages/_app.jsx')

  assert.doesNotMatch(app, /import\s+DarkModeToggle\s+from/)
  assert.doesNotMatch(app, /import\s+UserMenu\s+from/)
  assert.equal((app.match(/<TopNavbar\s*\/>/g) ?? []).length, 1)
  assert.equal((app.match(/<Navbar\s*\/>/g) ?? []).length, 1)
  assert.equal((app.match(/<DarkModeToggle\s*\/>/g) ?? []).length, 0)
  assert.equal((app.match(/<UserMenu\s*\/>/g) ?? []).length, 0)
})
