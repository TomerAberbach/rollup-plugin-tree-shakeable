import { defineConfig } from 'tsdown/config'

export default defineConfig([
  {
    entry: `src/index.ts`,
    platform: `neutral`,
    sourcemap: `inline`,
    publint: true,
  },
  {
    entry: `src/index.ts`,
    dts: { emitDtsOnly: true },
  },
])
