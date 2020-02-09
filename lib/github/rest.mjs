import Octokit from '@octokit/rest'

import { argv } from '../args.mjs'
import logger from '../logger.mjs'

const version = process.env.npm_package_version

const options = {
  userAgent: `github_exporter/${version} (jkroepke/github_exporter; +https://github.com/jkroepke/github_exporter)`,
  log: {
    debug: (message, additionalInfo) => logger.debug(message, additionalInfo),
    info: (message, additionalInfo) => logger.verbose(message, additionalInfo),
    warn: (message, additionalInfo) => logger.warn(message, additionalInfo),
    error: (message, additionalInfo) => logger.error(message, additionalInfo)
  }
}

if (argv.token) {
  options.auth = argv.token
}

export default new Octokit.Octokit(options)
