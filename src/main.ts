import * as core from '@actions/core'
import * as github from '@actions/github'
import {PullRequestOpenedEvent} from '@octokit/webhooks-definitions/schema'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    const octokit = github.getOctokit(token)
    const {owner, repo} = github.context.repo
    const prNumber = github.context.payload.pull_request?.number

    if (!prNumber) {
      throw new Error(
        'Action should be used in context of a pull request. Could not find pull request number'
      )
    }

    const event = github.context.payload as PullRequestOpenedEvent
    const targetBranch = event.pull_request.base.ref
    const user = event.pull_request.base.user.login

    const labels = [targetBranch, user]
    core.info(`Adding labels ${labels}`)

    await octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/labels',
      {
        owner: owner,
        repo: repo,
        issue_number: prNumber,
        labels: labels
      }
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
