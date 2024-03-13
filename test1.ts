import RouterData from './src/core/routerData'
import { getFullPathOfPageGlob, getGlobResult, handleValidatePageGlob } from './src/core/utils'

function test() {
  const routerData = new RouterData()
  const { pagePatterns, pageExcludePatterns, pageDir } = routerData.options
  const glob = getGlobResult(pagePatterns, pageExcludePatterns, pageDir)
  console.log(glob)
  const { cwd } = routerData.options
  const globWithFullPath = glob.map(item => getFullPathOfPageGlob(item, pageDir, cwd))
  console.log(globWithFullPath)
  globWithFullPath.forEach((item, index) => {
    console.log(handleValidatePageGlob(glob[index], item))
  })
}

test()
