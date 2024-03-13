interface GeneratorOptions {
  cwd: string
  pageDir: string
  alias: {
    '@': string
  }
  pagePatterns: string[]
  pageExcludePatterns: string[]
  routeNameTransformer: (name: string) => string
  routePathTransformer: (_transformedName: string, path: string) => string
  log: boolean
}

interface RouterTree {
  path: string
  name: string
  children: RouterTree[]
}

interface GeneratorRouterFile {
  /** fast-glob的结果 */
  glob: string
  /** glob后补全绝对位置 */
  fullPath: string
  /**
   * import的路径
   *
   * - 路径是相对于项目根目录的路径
   * - 如果设置了页面目录别名，路径将相对于别名
   */
  importPath: string
  /**
   * 经过transform，得到路由名称
   *
   * - 转换路径中的"/"为下划线"_"
   * - 如果以"_"开头，该部分将不出现在路由名称中
   * - 如果包含大写字母，将转换为小写
   * - 如果是类似"demo/[id].vue"的glob，"id"将被识别为路由参数
   *
   * @example
   *   "a/b/c" => "a_b_c"
   *   "a/b/[id]" => "a_b", id将被识别为路由参数
   *   "a/b_c/d" => "a_b_c_d"
   *   "_a/b_c/d" => "b_c_d", 因为"_a"使用了下划线开头，所以它不会出现在路由名称中
   */
  routeName: string
  /**
   * 转换后的路由路径
   *
   * - 将路径中的"_"转换为"/"
   * - 如果是类似"demo/[id].vue"的glob，"id"将被识别为路由参数
   *
   * @example
   *   "a/b/c" => "/a/b/c"
   *   "a/b_c/d" => "/a/b/c/d"
   *   "a/b/[id]" => "/a/b/:id"
   */
  routePath: string
  /**
   * 路由参数的key
   *
   * 如果glob是类似"demo/[id].vue"的glob，"id"将被识别为路由参数
   *
   * @default ''
   */
  routeParamKey: string
}

/**
 * 路由名称和路径的映射
 *
 * Map<name, path>
 */
type GeneratorRouterNamePathMap = Map<string, string>

/**
 * 路由名称和路径的映射的数组
 *
 * 根据名称排序
 *
 * @example
 *   ['a', '/a'];
 */
type GeneratorRouterNamePathEntries = [string, string]

/** the tree of the route */
interface GeneratorRouterTree {
  routeName: string
  routePath: string
  children?: GeneratorRouterTree[]
}
