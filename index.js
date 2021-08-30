import axios from 'axios'

const githubUrl = 'https://api.github.com'
const repoOwner = 'rails'
const repoName = 'rails'
const commitsPath = `${githubUrl}/repos/${repoOwner}/${repoName}/commits`
const recordsPerPage = 30

const getHeader = async (path, params) => {
  try {
    const response = await axios.head(path, {
      params: params
    })
    return response.headers
  } catch (error) {
    console.error(error)
    return null
  }
}

const getNumOfPages = (header) => {
  const reg = /page=(?<lastpage>\d+)/
  let numOfPages = 1

  if (header.link) {
    const pageLinks = header.link.split(',')
    const lastPageLink = pageLinks[pageLinks.length-1]

    const matchResult = lastPageLink.match(reg)
    const lastPage = matchResult.groups ? matchResult.groups.lastpage : null
    numOfPages = lastPage ? lastPage : 1
  }
  return numOfPages
}

const getPath = async (path, params) => {
  try {
    const response = await axios.get(path, {
      params: params
    })
    return response.data
  } catch (error) {
    console.error(error)
    return null
  }
}

const retrieveCommitsCount = (commits) => {
  const commitsCount = {}
  let committer
  for (const c of commits) {
    committer = c.author.login
    commitsCount[committer] = commitsCount[committer] ? commitsCount[committer] + 1 : 1
  }
  return commitsCount
}

const sortObjKeysByValue = (obj) => {
  let keys = Object.keys(obj)
  keys.sort((a, b) => {
    return obj[b] - obj[a]
  })
  return keys
}

const buildObj = (ary, originalObj) => {
  const resultObj = {}
  for (const o of ary) {
    resultObj[o] = originalObj[o]
  }
  return resultObj
}


const getCommitsCount = async (path, params) => {
  let numOfPages = 1
  let commitsCount = {}
  let totalCommitsCount = {}

  try {
    const header = await getHeader(path, params)
    if (header) {
      numOfPages = getNumOfPages(header)
      console.log('numOfPages', numOfPages)
    }
  } catch (error) {
    console.error(error)
  }

  //numOfPages = 0
  for (let page = 1; page <= numOfPages; page++) {
    try {
      const data = await getPath(path, { ...params, page: page })
      console.log(data.length)
      commitsCount = retrieveCommitsCount(data)
      //console.log('commitsCount', commitsCount)
      totalCommitsCount = { ...totalCommitsCount, ...commitsCount}

    } catch (error) {
      console.error(error)
    }
  }

  console.log("totalCommitsCount", totalCommitsCount)

  // sort totalCommitsCount by count desc
  const sortedCommitters = sortObjKeysByValue(totalCommitsCount)
  const top10Committers = sortedCommitters.slice(0, 10)

  const top10CommitersAndCommits = buildObj(top10Committers, totalCommitsCount)
  console.log('top10CommitersAndCommits', top10CommitersAndCommits)

  // console.log('result', result)
  console.log('top10Committers', top10Committers)
}

const params = { since: '2021-07-20T00:00:00Z' }
const page = 1
//getHeader({ since: '2021-07-20T00:00:00Z' })
getCommitsCount(commitsPath, { since: '2021-07-20T00:00:00Z' })

// const data = await getPath(commitsPath, { ...params, page: page })
// console.log(data[0])


