import path from 'node:path'
import { PAGE_DEGREE_SPLITTER, PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN, PATH_SPLITTER } from './const'
import { getFullPathOfPageGlob } from './utils'

/**
 * 将glob转成router文件
 * @param glob
 * @param options
 */
export function transformPageGlobToRouterFile(glob: string, options: GeneratorOptions) {
  const { cwd, pageDir, alias, routeNameTransformer } = options

  // 1. get path info
  const fullPath = getFullPathOfPageGlob(glob, pageDir, cwd)
  let importPath = path.posix.join(pageDir, glob)

  const aliasEntries = Object.entries(alias)

  aliasEntries.some(item => {
    const [a, dir] = item
    const match = importPath.startsWith(dir)

    if (match) {
      importPath = importPath.replace(dir, a)
    }
    return match
  })

  // 2. get route info
  const dirAndFile = glob.split(PATH_SPLITTER).reverse()
  const [file, ...dirs] = dirAndFile

  const filteredDirs = dirs.filter(dir => !dir.startsWith(PAGE_DEGREE_SPLITTER)).reverse()

  const routeName = routeNameTransformer(filteredDirs.join(PAGE_DEGREE_SPLITTER).toLocaleLowerCase())
  let routePath = transformRouterNameToPath(routeName)

  let routeParamKey = ''

  if (PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN.test(file)) {
    const [fileName] = file.split('.')
    routeParamKey = fileName.replace(/\[|\]/g, '')
    routePath = `${routePath}/:${routeParamKey}`
  }

  const item: GeneratorRouterFile = {
    glob,
    fullPath,
    importPath,
    routeName,
    routePath: options.routePathTransformer(routeName, routePath),
    routeParamKey,
  }

  return item
}

/**
 * transform the router files to the router maps (name -> path)
 *
 * @param files
 * @param options
 */
export function transformRouterFilesToMaps(files: GeneratorRouterFile[], options: GeneratorOptions) {
  const maps: GeneratorRouterNamePathMap = new Map<string, string>()

  files.forEach(file => {
    const { routeName, routePath } = file

    const names = splitRouterName(routeName)

    names.forEach(name => {
      if (!maps.has(name)) {
        const isSameName = name === routeName

        const itemRouteName = isSameName ? name : options.routeNameTransformer(name)
        const itemRoutePath = isSameName
          ? routePath
          : options.routePathTransformer(itemRouteName, transformRouterNameToPath(name))

        maps.set(itemRouteName, itemRoutePath)
      }
    })
  })

  return maps
}

/**
 * transform the router files to the router entries (name -> path)
 *
 * @param maps
 */
export function transformRouterMapsToEntries(maps: GeneratorRouterNamePathMap) {
  const entries: GeneratorRouterNamePathEntries[] = []

  maps.forEach((routePath, routeName) => {
    entries.push([routeName, routePath])
  })

  return entries.sort((a, b) => a[0].localeCompare(b[0]))
}

/**
 * transform the router entries to the router trees
 *
 * @param entries
 * @param options
 */
export function transformRouterEntriesToTrees(
  entries: GeneratorRouterNamePathEntries[],
  maps: GeneratorRouterNamePathMap,
) {
  const treeWithClassify = new Map<string, string[][]>()

  entries.forEach(([routeName]) => {
    const isFirstLevel = !routeName.includes(PAGE_DEGREE_SPLITTER)

    if (isFirstLevel) {
      treeWithClassify.set(routeName, [])
    } else {
      const firstLevelName = routeName.split(PAGE_DEGREE_SPLITTER)[0]

      const levels = routeName.split(PAGE_DEGREE_SPLITTER).length

      const currentLevelChildren = treeWithClassify.get(firstLevelName) || []

      const child = currentLevelChildren[levels - 2] || []

      child.push(routeName)

      currentLevelChildren[levels - 2] = child

      treeWithClassify.set(firstLevelName, currentLevelChildren)
    }
  })

  const trees: GeneratorRouterTree[] = []

  treeWithClassify.forEach((children, key) => {
    const firstLevelRoute: GeneratorRouterTree = {
      routeName: key,
      routePath: maps.get(key) || '',
    }

    const treeChildren = recursiveGetRouteTreeChildren(key, children, maps)

    if (treeChildren.length > 0) {
      firstLevelRoute.children = treeChildren
    }

    trees.push(firstLevelRoute)
  })

  return trees
}

/**
 * recursive get the route tree children
 *
 * @param parentName
 * @param children
 * @param maps
 */
function recursiveGetRouteTreeChildren(parentName: string, children: string[][], maps: GeneratorRouterNamePathMap) {
  if (children.length === 0) {
    return []
  }

  const [current, ...rest] = children

  const currentChildren = current.filter(name => name.startsWith(parentName))

  const trees = currentChildren.map(name => {
    const tree: GeneratorRouterTree = {
      routeName: name,
      routePath: maps.get(name) || '',
    }

    const nextChildren = recursiveGetRouteTreeChildren(name, rest, maps)

    if (nextChildren.length > 0) {
      tree.children = nextChildren
    }
    return tree
  })

  return trees
}

/**
 * split the router name
 *
 * @example
 *   a_b_c => ['a', 'a_b', 'a_b_c'];
 *
 * @param name
 */
export function splitRouterName(name: string) {
  const names = name.split(PAGE_DEGREE_SPLITTER)

  return names.reduce((prev, cur) => {
    const last = prev[prev.length - 1]

    const next = last ? `${last}${PAGE_DEGREE_SPLITTER}${cur}` : cur

    prev.push(next)

    return prev
  }, [] as string[])
}

/**
 * transform the router name to the router path
 *
 * @example
 *   a_b_c => '/a/b/c';
 *
 * @param name
 */
export function transformRouterNameToPath(name: string) {
  const routerPath = PATH_SPLITTER + name.replaceAll(PAGE_DEGREE_SPLITTER, PATH_SPLITTER)

  return routerPath
}
