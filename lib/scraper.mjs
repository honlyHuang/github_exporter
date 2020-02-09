import logger from './logger.mjs'
import { argv } from './args.mjs'
import ghRestApi from './github/rest.mjs'
import * as Scrapers from './scraper/index.mjs'

const scraperModules = argv.scraper.map((scraperModule) => {
  const scraperModuleIndex = scraperModule
    .replace(/-(\w)/g,
      (v) => v.toUpperCase()
        .replace('-', '')
    )

  return new Scrapers[scraperModuleIndex]()
})

const globalScraperModules = scraperModules.filter((module) => typeof module.scrapeGlobal === 'function')
const repositoryScraperModules = scraperModules.filter((module) => typeof module.scrapeRepositories === 'function')

const scrapeRepositories = (repositories) => {
  repositoryScraperModules.forEach((scraper) => {
    scraper.scrapeRepositories(repositories)
  })
}

const initScrapeGlobal = (interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0

  const scrapeHandler = () => {
    globalScraperModules.forEach((scraper) => {
      scraper.scrapeGlobal()
    })
  }

  setTimeout(() => {
    scrapeHandler()
    setInterval(scrapeHandler, interval)
  }, startScrape)
}

const initScrapeOrganization = (organization, interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0

  const scrapeHandler = () => {
    const options = ghRestApi.repos.listForOrg.endpoint.merge({
      org: organization
    })

    ghRestApi.paginate(
      options,
      (response) => response.data.map((repository) => repository.full_name)
    )
      .then((repositories) => scrapeRepositories(repositories))
      .catch((err) => logger.error(`Failed to get all repository from organization ${organization} via REST: `, err.message))
  }

  setTimeout(() => {
    scrapeHandler()
    setInterval(scrapeHandler, interval)
  }, startScrape)
}

const initScrapeUser = (username, interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0

  const scrapeHandler = () => {
    const options = ghRestApi.repos.listForUser.endpoint.merge({
      username,
      type: 'owner'
    })

    ghRestApi.paginate(
      options,
      (response) => response.data.map((repository) => repository.full_name)
    )
      .then((repositories) => scrapeRepositories(repositories))
      .catch((err) => logger.error(`Failed to get all repository from user ${username} via REST: `, err.message))
  }

  setTimeout(() => {
    scrapeHandler()
    setInterval(scrapeHandler, interval)
  }, startScrape)
}

const intiScrapeRepositories = (repositories, interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0

  const scrapeHandler = () => {
    scrapeRepositories(repositories)
  }

  setTimeout(() => {
    scrapeHandler()
    setInterval(scrapeHandler, interval)
  }, startScrape)
}

export {
  initScrapeGlobal,
  initScrapeOrganization,
  initScrapeUser,
  intiScrapeRepositories
}
