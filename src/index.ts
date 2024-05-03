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

import type { AstNodeLocation, Plugin } from 'rollup'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'

const treeShakeable = (): Plugin => ({
  name: `tree-shakeable`,
  renderChunk(code) {
    const magicString = new MagicString(code)

    const skipLater = new WeakSet()
    walk(this.parse(code), {
      enter(node) {
        if (skipLater.has(node)) {
          this.skip()
          return
        }

        const { start, end } = node as unknown as AstNodeLocation

        switch (node.type) {
          // Any nodes inside functions are not "top level" and don't impact
          // tree shaking. Any control flow or mutation must be initialization
          // code that's assumed to be needed by everything.
          case `ArrowFunctionExpression`:
          case `FunctionDeclaration`:
          case `FunctionExpression`:
          case `MethodDefinition`:
          case `ForInStatement`:
          case `ForOfStatement`:
          case `ForStatement`:
          case `WhileStatement`:
          case `ThrowStatement`:
          case `UpdateExpression`:
            this.skip()
            break

          case `ClassBody`:
            // Everything inside a class body can be recursively handled except
            // for non-static property definitions, which have to be explicitly
            // filtered out because they are not "top level" and don't impact
            // tree shaking.
            for (const member of node.body) {
              if (member.type === `PropertyDefinition` && !member.static) {
                skipLater.add(member)
              }
            }
            break

          case `CallExpression`:
          case `NewExpression`:
            magicString.appendLeft(start, `/*@__PURE__*/`)
            break

          case `MemberExpression`:
            magicString
              .appendLeft(start, `/*@__PURE__*/(()=>(`)
              .appendLeft(end, `))()`)
            this.skip()
            break

          case `ObjectExpression`:
            // An object literal is usually automatically treated as pure, but
            // not if something is spread into it, because the iterable being
            // spread could have side effects as part of being iterated.
            if (
              node.properties.some(
                property => property.type === `SpreadElement`,
              )
            ) {
              magicString
                .appendLeft(start, `/*@__PURE__*/(()=>(`)
                .appendLeft(end, `))()`)
            }
            break

          case `ArrayExpression`:
            // An array literal is usually automatically treated as pure, but
            // not if something is spread into it, because the iterable being
            // spread could have side effects as part of being iterated.
            if (
              node.elements.some(element => element?.type === `SpreadElement`)
            ) {
              magicString
                .appendLeft(start, `/*@__PURE__*/(()=>(`)
                .appendLeft(end, `))()`)
            }
            break

          default:
            // Fall through.
            break
        }
      },
    })

    return magicString.hasChanged()
      ? {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        }
      : null
  },
})

export default treeShakeable
