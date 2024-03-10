import type { FSWatcher } from 'chokidar'

interface RouterTree {
  path: string
  name: string
  children: RouterTree[]
}

export default class RouterData {
  // 页面遍历结果
  pageBlog: string[] = []
  // 路由文件
  routerFiles: string[] = []
  // 路由名称-路径映射
  routerMap = new Map<string, string>()
  // 路由名称-入口映射
  routerEntries: [string, string][] = []
  // 路由树
  routerTree: RouterTree[] = []
  // fs监视器
  fsWatcher?: FSWatcher

  constructor() {
    this.init()
  }

  scanPages() {
    this.getPageGlobs()
    this.getRouterContextProps()
  }

  getPageGlobs() {
    const { pagePatterns, pageExcludePatterns, pageDir } = this.options

    const globs = getGlobs(pagePatterns, pageExcludePatterns, pageDir)

    this.pageGlobs = this.filterValidPageGlobs(globs)
  }
}
