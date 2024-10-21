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
            skipLater.add(node.callee)
            break

          case `AssignmentExpression`:
            // Skip the lefthand side of an assignment because we can't wrap it
            // in an IIFE below if it's a member expression.
            skipLater.add(node.left)
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
