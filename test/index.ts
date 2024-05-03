/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rollup } from 'rollup'
import { build } from 'esbuild'
import treeShakeable from '../src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

test(`treeShakeable works`, async () => {
  const fixturePath = join(__dirname, `fixtures/fixture1.js`)

  const output = await rollup({
    input: fixturePath,
    treeshake: false,
    plugins: [treeShakeable()],
  })
  const rollupOutput = (
    await output.write({ file: join(__dirname, `../tmp/out.js`) })
  ).output[0].code
  await output.close()

  expect(rollupOutput).toMatchInlineSnapshot(`
"/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const logAndReturn = x => {
  console.log(\`log\`);
  return x
};

const a = /*@__PURE__*/logAndReturn(\`Hello World!\`);

class C extends class S {
  #f = logAndReturn(\`field\`)

  static F = /*@__PURE__*/logAndReturn(\`static field\`)
} {
  #f = logAndReturn(\`field\`)

  m() {
    logAndReturn(\`method\`);
  }

  static F = /*@__PURE__*/logAndReturn(\`static field\`)
}
const c = /*@__PURE__*/new C();

const entries = [[\`c\`, 3]];
const o1 = { a: 1, b: 2 };
const o2 = /*@__PURE__*/(()=>({ a: 1, b: 2, ...entries }))();
const spread = /*@__PURE__*/(()=>([...entries]))();

const p = /*@__PURE__*/(()=>({}.hasOwnProperty))();

const answer = 42;

export { a, answer, c, o1, o2, p, spread };
"
`)
  const result = await build({
    entryPoints: [join(__dirname, `fixtures/fixture2.js`)],
    bundle: true,
    minify: true,
    write: false,
  })
  expect(result.outputFiles[0]!.text).toMatchInlineSnapshot(`
""use strict";(()=>{var o=42;console.log(o);})();
"
`)
})
