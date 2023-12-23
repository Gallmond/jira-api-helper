
type TokensResponse = {
    access_token: string
    refresh_token: string
    expires_in: number
    valid_until: Date
}

// type DataPlural = 'values' | 'issues'
type API_Paginate<T> = {
    self?: string
    isLast?: boolean
    next?: string
    startAt: number
    maxResults: number
    total: number
    // how do I do this without having to redeclare each one?
    values?: T[]
    issues?: T[]
}

type API_SitesResponse = {
    id: string,
    url: string,
    name: string,
    scopes: string[],
    avatarUrl: string,
}[]

type UrlSizeKeys = '16x16' | '24x24' | '32x32' | '48x48'
type API_ProjectListingResponse = {
    id: string
    entityId: string
    uuid: string
    key: string
    name: string
    self: string
    avatarUrls: Record<UrlSizeKeys, string>
}

type API_IssueType = {
    self: string           // "https://api.atlassian.com/ex/jira/2c4db73f-3b84-45f0-8227-5ea9e43b6db9/rest/api/3/issuetype/10003",
    id: string             // "10003",
    description: string    // "Subtasks track small pieces of work that are part of a larger task.",
    iconUrl: string        // "https://api.atlassian.com/ex/jira/2c4db73f-3b84-45f0-8227-5ea9e43b6db9/rest/api/2/universal_avatar/view/type/issuetype/avatar/10316?size=medium",
    name: string           // "Subtask",
    subtask: boolean       // true,
    avatarId: number       // 10316,
    entityId: string       // "13dba56b-8313-4a0d-8d40-fecbee43a587",
    hierarchyLevel: number // -1
}

type API_IssueStatus = {
    self: string
    description: string
    iconUrl: string
    name: string
    id: string
    statusCategory: {
      self: string
      id: number
      key: string
      colorName: string
      name: string
    }
}

type API_PersonIdentifier = {
    self: string
    accountId: string
    emailAddress: string
    avatarUrls: string
    displayName: string
    active: boolean
    timeZone: string
    accountType: string
}

type API_IssueListingResponseMinimal = {
    id: string
    key: string
    self: string
    fields: {
        summary: string
        status: API_IssueStatus
        issuetype: API_IssueType
    }
}

type API_IssueListingResponse = {
    id: string
    key: string
    self: string
    fields: {
        project: API_ProjectListingResponse
        parent?: API_IssueListingResponse
        issuetype: API_IssueType
        description: string | null // appears this isn't used for issues?
        summary: string
        created: string
        updated: string
        creator: API_PersonIdentifier
        reporter: API_PersonIdentifier
        subtasks: API_IssueListingResponseMinimal[]
        status: API_IssueStatus
    }
}

type FetchInterface = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>