import { PullRequestState } from '../../inspectors';
import { argumentsProviderFactory } from '../../test/factories/ArgumentsProviderFactory';
import { gitLabPullRequestResponseFactory } from '../../test/factories/responses/gitLab/prResponseFactory';
import { GitLabNock } from '../../test/helpers/gitLabNock';
import { GitLabService } from './GitLabService';
import { GitLabPullRequestState } from './IGitLabService';
import util from 'util';
import { listPullRequestsResponse } from '../git/__MOCKS__/gitLabServiceMockFolder/listPullRequestsResponse';
import { getPullRequestResponse } from '../git/__MOCKS__/gitLabServiceMockFolder/getPullRequestResponse';
import { getPullCommitsResponse } from '../git/__MOCKS__/gitLabServiceMockFolder/getPullCommitsResponse';
import { gitLabCommitsResponseFactory } from '../../test/factories/responses/gitLab/commitsFactory';
import { getRepoCommit } from '../git/__MOCKS__/gitLabServiceMockFolder/getRepoCommitResponse';
import { gitLabRepoCommitsResponseFactory } from '../../test/factories/responses/gitLab/repoCommitResponseFactory';
import { getRepoCommits } from '../git/__MOCKS__/gitLabServiceMockFolder/listRepoCommitsResponse';
import { gitLabIssueResponseFactory } from '../../test/factories/responses/gitLab/issueResponseFactory';
import { getIssueResponse } from '../git/__MOCKS__/gitLabServiceMockFolder/getIssueResponse';
import { listIssuesResponse } from '../git/__MOCKS__/gitLabServiceMockFolder/listIssuesResponse';

describe('GitLab Service', () => {
  let service: GitLabService;
  let gitLabNock: GitLabNock;

  beforeEach(async () => {
    service = new GitLabService(argumentsProviderFactory({ uri: 'https://gitlab.com/gitlab-org/gitlab' }));
    gitLabNock = new GitLabNock('gitlab-org', 'gitlab');
  });

  it('Returns list of merge requests in own interface', async () => {
    jest.setTimeout(100000);

    const mockPr = gitLabPullRequestResponseFactory();

    gitLabNock.getGroupInfo();
    gitLabNock.listPullRequestsResponse([mockPr], { filter: { state: GitLabPullRequestState.open } });

    const response = await service.listPullRequests('gitlab-org', 'gitlab', { filter: { state: PullRequestState.open } });
    expect(response).toMatchObject(listPullRequestsResponse());
  });

  it('Returns one pull request in own interface', async () => {
    jest.setTimeout(100000);

    const mockPr = gitLabPullRequestResponseFactory();

    gitLabNock.getPullRequestResponse(mockPr, 25985);
    gitLabNock.getGroupInfo();

    const response = await service.getPullRequest('gitlab-org', 'gitlab', 25985);
    expect(response).toMatchObject(getPullRequestResponse());
  });

  it('Returns pull commits in own interface', async () => {
    const mockCommits = gitLabCommitsResponseFactory();

    gitLabNock.listPullCommitsResponse([mockCommits], 25985);
    gitLabNock.getCommitResponse(mockCommits, '4eecfba1b1e2c35c13a7b34fc3d71e58cbb3645d');

    const response = await service.listPullCommits('gitlab-org', 'gitlab', 25985);
    expect(response).toMatchObject(getPullCommitsResponse());
  });

  it('Returns repo commit in own interface', async () => {
    const mockCommits = gitLabCommitsResponseFactory();

    gitLabNock.getCommitResponse(mockCommits, 'df760e1c');

    const response = await service.getCommit('gitlab-org', 'gitlab', 'df760e1c');
    expect(response).toMatchObject(getRepoCommit());
  });

  it('Returns repo commits in own interface', async () => {
    const mockCommits = gitLabRepoCommitsResponseFactory();

    gitLabNock.listRepoCommitsResponse([mockCommits]);

    const response = await service.listRepoCommits('gitlab-org', 'gitlab');
    expect(response).toMatchObject(getRepoCommits());
  });

  it('Returns one issue in own interface', async () => {
    const mockIssue = gitLabIssueResponseFactory({});
    gitLabNock.getIssueResponse(mockIssue);

    const response = await service.getIssue('gitlab-org', 'gitlab', 207825);
    expect(response).toMatchObject(getIssueResponse());
  });

  it('Returns issues in own interface', async () => {
    jest.setTimeout(100000);
    const mockIssue = gitLabIssueResponseFactory({});

    gitLabNock.listIssuesResponse([mockIssue]);
    gitLabNock.getGroupInfo();

    const response = await service.listIssues('gitlab-org', 'gitlab');
    expect(response).toMatchObject(listIssuesResponse());
  });
});
