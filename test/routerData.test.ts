import { describe, expect, it } from 'vitest'
import RouterData from '../src/core/routerData'

describe('router data', () => {
  it('test scan', () => {
    const routerData = new RouterData()
    expect(routerData.pageGlobs).toMatchInlineSnapshot(`
      [
        "user/index.vue",
        "user/info/[id].vue",
      ]
    `)
    // expect(routerData.routerFiles).toMatchInlineSnapshot(`
    //   [
    //     {
    //       "fullPath": "D:\\\\projects\\\\npm\\\\@wyatex\\\\vue-router-generator/src/views/user/index.vue",
    //       "glob": "user/index.vue",
    //       "importPath": "@/views/user/index.vue",
    //       "routeName": "user",
    //       "routeParamKey": "",
    //       "routePath": "/user",
    //     },
    //     {
    //       "fullPath": "D:\\\\projects\\\\npm\\\\@wyatex\\\\vue-router-generator/src/views/user/info/[id].vue",
    //       "glob": "user/info/[id].vue",
    //       "importPath": "@/views/user/info/[id].vue",
    //       "routeName": "user_info",
    //       "routeParamKey": "id",
    //       "routePath": "/user/info/:id",
    //     },
    //   ]
    // `)
    expect(routerData.routerMap).toMatchInlineSnapshot(`
      Map {
        "user" => "/user",
        "user_info" => "/user/info/:id",
      }
    `)
    expect(routerData.routerEntries).toMatchInlineSnapshot(`
      [
        [
          "user",
          "/user",
        ],
        [
          "user_info",
          "/user/info/:id",
        ],
      ]
    `)
    expect(routerData.routerTree).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "routeName": "user_info",
              "routePath": "/user/info/:id",
            },
          ],
          "routeName": "user",
          "routePath": "/user",
        },
      ]
    `)
  })
})
