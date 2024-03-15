import process from 'node:process'
import type { FSWatcher } from 'chokidar'
import { getFullPathOfPageGlob, getGlobResult, handleValidatePageGlob } from './utils'
import {
  transformPageGlobToRouterFile,
  transformRouterEntriesToTrees,
  transformRouterFilesToMaps,
  transformRouterMapsToEntries,
} from './transform'

// 要扫描的目录
const PAGE_DIR = 'src/views'
// 要扫描的文件
const PAGE_PATTERNS = ['**/index.vue', '**/[[]*[]].vue']
// 要排除的文件
const PAGE_EXCLUDE_PATTERNS = ['**/components/**']

export default class RouterData {
  // 页面遍历结果
  pageGlobs: string[] = []
  // 路由文件
  routerFiles: GeneratorRouterFile[] = []
  // 路由名称-路径映射
  routerMap: GeneratorRouterNamePathMap = new Map<string, string>()
  // 路由名称-入口映射
  routerEntries: GeneratorRouterNamePathEntries[] = []
  // 路由树
  routerTree: GeneratorRouterTree[] = []
  // fs监视器
  fsWatcher?: FSWatcher
  // 参数
  options: GeneratorOptions

  constructor(options: Partial<GeneratorOptions> = {}) {
    this.options = {
      cwd: process.cwd(),
      pageDir: PAGE_DIR,
      alias: {
        '@': 'src',
      },
      pagePatterns: PAGE_PATTERNS,
      pageExcludePatterns: PAGE_EXCLUDE_PATTERNS,
      routeNameTransformer: name => name,
      routePathTransformer: (_transformedName, path) => path,
      log: true,
      ...options,
    }
    this.scanPages()
  }

  scanPages() {
    this.getPageGlobs()
    this.getRouterContextProps()
  }

  getPageGlobs() {
    const { pagePatterns, pageExcludePatterns, pageDir } = this.options
    const globs = getGlobResult(pagePatterns, pageExcludePatterns, pageDir)
    this.pageGlobs = this.filterValidPageGlobs(globs)
  }

  /**
   * 过滤有效的页面glob
   * @param globs
   */
  filterValidPageGlobs(globs: string[]) {
    const { cwd, pageDir } = this.options
    return globs.filter(glob => {
      const fullGlob = getFullPathOfPageGlob(glob, pageDir, cwd)
      const isValid = handleValidatePageGlob(glob, fullGlob)
      return isValid
    })
  }

  /** get the router context props */
  getRouterContextProps() {
    this.routerFiles = this.pageGlobs.map(glob => transformPageGlobToRouterFile(glob, this.options))
    this.routerMap = transformRouterFilesToMaps(this.routerFiles, this.options)
    this.routerEntries = transformRouterMapsToEntries(this.routerMap)
    this.routerTree = transformRouterEntriesToTrees(this.routerEntries, this.routerMap)
  }
}
