
import {config} from 'dotenv'
import API from './api/Api.js'
import { readFileSync, writeFileSync } from 'fs'
import { DEBUG_write } from './utils/utils.js'
config()

const CODE = 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhOWU0ODUwZi04ZTRjLTQ1ZGEtYjQ2YS02MGIyMTVmY2Y2YjciLCJzdWIiOiI2MTFhMmIxYTY1MGEyNjAwNmUxYTMzY2UiLCJuYmYiOjE3MDMyNzA3NTQsImlzcyI6ImF1dGguYXRsYXNzaWFuLmNvbSIsImlhdCI6MTcwMzI3MDc1NCwiZXhwIjoxNzAzMjcxMDU0LCJhdWQiOiJzRkRndVh4TnJya25EM2ZRVklneUx3MlYxOEhOdHhYTiIsImNsaWVudF9hdXRoX3R5cGUiOiJQT1NUIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3ZlcmlmaWVkIjp0cnVlLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdWp0IjoiYTllNDg1MGYtOGU0Yy00NWRhLWI0NmEtNjBiMjE1ZmNmNmI3Iiwic2NvcGUiOlsicmVhZDpqaXJhLXdvcmsiLCJyZWFkOmFjY291bnQiLCJvZmZsaW5lX2FjY2VzcyIsInJlYWQ6bWUiLCJyZWFkOmppcmEtdXNlciJdLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJBVVRIX0NPREUiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vaGFzUmVkaXJlY3RVcmkiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiOGQxNjU4YTQtY2MxZS00MzMwLTg1ZGYtZDQ3NmYzOWQyMGFhIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Byb2Nlc3NSZWdpb24iOiJ1cy1lYXN0LTEifQ.8iXKPEwHbcmBeg7NGeTT43yshG0iH66BdLORbjNkK-M'

const writeTokens = (tokens: TokensResponse): void => {
    console.log('attempting to set tokens', {tokens})
    const data = JSON.stringify({
        ...tokens,
        valid_until: tokens.valid_until.valueOf()
    }, null, 2)
    writeFileSync('./temp-tokens.temp', data)
    console.log('finished writing temp tokens')
}
const readTokens = (): TokensResponse => {
    console.log('attemping to read tokens')
    const data = JSON.parse(readFileSync('./temp-tokens.temp', 'utf8'))
    return {
        ...data,
        valid_until: new Date(data.valid_until)
    }
}


const testFetcher: FetchInterface = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = input instanceof URL ? input : new URL(input as string)
    const path = url.pathname

    const bodyParams = init?.body ? JSON.parse(init.body as string) : {}

    console.log({path, bodyParams})

    // handle token response
    // if(path === '/oauth/token' && ['authorization_code'].includes(bodyParams['grant_type'])){
    //     return new Response(JSON.stringify({
    //         access_token: accessToken,
    //         refresh_token: refreshToken,
    //         expires_in: (new Date().valueOf() + 60000).toString(),
    //     }), {
    //         headers: {'content-type': 'application/json'}
    //     })
    // }

    // handle sites response
    // if(path === '/oauth/token/accessible-resources'){
    //     const sites = [
    //         {
    //             id: '1234',
    //             url: 'https://some-jira-instance.com',
    //             name: 'gavins site',
    //             scopes: ['foo', 'bar'],
    //             avatarUrl: 'https://some-jira-instance.com/avatar.png'
    //         }
    //     ]

    //     return new Response(JSON.stringify(sites), {
    //         headers: {'content-type': 'application/json'}
    //     })
    // }

    console.log(`no handler for ${path}, sending actual request`)
    return fetch(input, init)
}


const initAPI = (): API => {
    const conf = {
        clientId: process.env.PUBLIC_JIRA_APP_CLIENT_ID as string,
        secret: process.env.SECRET_JIRA_APP_SECRET as string,
        redirectUri: process.env.PUBLIC_JIRA_AUTH_REDIRECT_URI as string,
        tokenSetter: writeTokens,
        tokenGetter: readTokens,
        autoRefresh: true,
    }

    return new API(conf, testFetcher)
}


const run = async () => {
    // init the api
    const a = initAPI()
    
    // // get the auth redirect url
    // const authUrl = a.getAuthUrl('some-state')
    // console.log({authUrl})

    // // get the tokens
    // const tokens = await a.getAuthTokens(CODE)
    // console.log('test, got tokens', {tokens})

    // list sites
    const sites = await a.listSites()
    console.log('test, got sites: ', {sites, stringified: JSON.stringify(sites, null, 2)})
    DEBUG_write('sites-example', sites)

    const siteId = sites[0].id as string

    const projectsPaginate = await a.listProjects(siteId)
    console.log('test, got projects', {projectsPaginate, stringified: JSON.stringify(projectsPaginate, null, 2)})
    DEBUG_write('projects-example', projectsPaginate)

    const projects = projectsPaginate.values as API_ProjectListingResponse[]
    for(const project of projects){
        const issues = await a.listIssues(siteId, project.key)
        console.log('test, got issues', {issues, stringified: JSON.stringify(issues, null, 2)})
        DEBUG_write('issues-example', issues)
    }

}

run()






