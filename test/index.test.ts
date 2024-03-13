import { describe, expect, it } from 'vitest'
import RouterData from '../src/core/routerData'
import { getGlobResult } from '../src/core/utils'

describe('glob', () => {
  it('test get glob', () => {
    const routerData = new RouterData()
    expect(routerData.pageGlobs).toStrictEqual(['user/index.vue', 'user/info/[id].vue'])
  })
  it('test transform', () => {
    const routerData = new RouterData()
    expect(routerData.routerMap).toStrictEqual(
      new Map([
        ['user', '/user'],
        ['user_info', '/user/info/:id'],
      ]),
    )
    expect(routerData.routerEntries).toStrictEqual([
      ['user', '/user'],
      ['user_info', '/user/info/:id'],
    ])
    expect(routerData.routerTree).toStrictEqual([
      {
        routeName: 'user',
        routePath: '/user',
        children: [
          {
            routeName: 'user_info',
            routePath: '/user/info/:id',
          },
        ],
      },
    ])
  })
})
