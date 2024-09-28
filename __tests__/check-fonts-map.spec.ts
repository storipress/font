import { expect, it } from 'vitest'

it('expect fonts map unchanged', async () => {
  let map
  try {
    map = await import('../font-list')
  } catch {
    expect.fail('font-list.ts not found')
  }
  expect(map).toMatchSnapshot()
})
