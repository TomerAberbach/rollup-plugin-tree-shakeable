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

export const answer = 42
