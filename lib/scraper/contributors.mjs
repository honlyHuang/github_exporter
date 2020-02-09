import Prometheus from 'prom-client'
import ghRestApi from '../github/rest.mjs'
import logger from '../logger.mjs'

class Contributors {
  constructor () {
    this.registerMetrics()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoContributorsGauge: new Prometheus.Gauge({
        name: 'github_repo_contributors',
        help: 'Total number of releases for given repository',
        labelNames: ['owner', 'repository']
      })
    }
  }

  scrapeRepositories (repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/')

      const options = ghRestApi.repos.listContributors.endpoint.merge({ owner, repo })

      ghRestApi.paginate(
        options,
        // data is null if repository is empty
        (response) => (response.data || []).map((collaborator) => collaborator)
      )
        .then((repositoryContributors) => {
          this.metrics.githubRepoContributorsGauge.set(
            { owner, repository },
            repositoryContributors.length
          )
        })
        .catch((err) => logger.error(`Failed to scrape contributors from repository ${repository} via REST: ${err.message}`, err))
    })
  }
}

export default Contributors
