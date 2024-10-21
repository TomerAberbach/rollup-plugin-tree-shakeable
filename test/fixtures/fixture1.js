const logAndReturn = x => {
  console.log(`log`)
  return x
}

export const a = logAndReturn(`Hello World!`)

class C extends class S {
  #f = logAndReturn(`field`)

  static F = logAndReturn(`static field`)
} {
  #f = logAndReturn(`field`)

  m() {
    logAndReturn(`method`)
  }

  static F = logAndReturn(`static field`)
}
export const c = new C()

const entries = [[`c`, 3]]
export const o1 = { a: 1, b: 2 }
export const o2 = { a: 1, b: 2, ...entries }
export const spread = [...entries]

const o3 = {}
o3.x = 2
export { o3 }

export const p = {}.hasOwnProperty

export const x = o3.x()

export const nested = logAndReturn(logAndReturn())

export const answer = 42
