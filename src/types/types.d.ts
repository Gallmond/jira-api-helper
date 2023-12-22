
type TokensResponse = {
    access_token: string
    refresh_token: string
    expires_in: number
    valid_until: Date
}

type API_SitesResponse = {
    id: string,
    url: string,
    name: string,
    scopes: string[],
    avatarUrl: string,
}[]

type FetchInterface = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>