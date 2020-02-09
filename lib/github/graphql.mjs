import graphql from '@octokit/graphql'

import { argv } from '../args.mjs'

const version = process.env.npm_package_version

const defaults = {
  headers: {
    'user-agent': `jkroepke/github_exporter v${version}`
  },
  mediaType: {
    previews: [
      'packages',
      'hawkgirl', // Dependency Graph GraphQL API
      'vixen' // Repository Vulnerability Alerts GraphQL API
    ]
  }
}

if (argv.token) {
  defaults.headers.authorization = `token ${argv.token}`
}

export default graphql.graphql.defaults(defaults)
