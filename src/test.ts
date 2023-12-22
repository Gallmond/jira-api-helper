import {config} from 'dotenv'
import API from './api/Api.js'
config()

const CODE = 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxYjQ2ZWYxNS0zMDM0LTRlODctOWNhNS1jNDhkMzUzYTZmMzUiLCJzdWIiOiI2MTFhMmIxYTY1MGEyNjAwNmUxYTMzY2UiLCJuYmYiOjE3MDMyNTY1NTcsImlzcyI6ImF1dGguYXRsYXNzaWFuLmNvbSIsImlhdCI6MTcwMzI1NjU1NywiZXhwIjoxNzAzMjU2ODU3LCJhdWQiOiJzRkRndVh4TnJya25EM2ZRVklneUx3MlYxOEhOdHhYTiIsImNsaWVudF9hdXRoX3R5cGUiOiJQT1NUIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3ZlcmlmaWVkIjp0cnVlLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdWp0IjoiMWI0NmVmMTUtMzAzNC00ZTg3LTljYTUtYzQ4ZDM1M2E2ZjM1Iiwic2NvcGUiOlsicmVhZDpqaXJhLXdvcmsiLCJyZWFkOmFjY291bnQiLCJvZmZsaW5lX2FjY2VzcyIsInJlYWQ6bWUiLCJyZWFkOmppcmEtdXNlciJdLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJBVVRIX0NPREUiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vaGFzUmVkaXJlY3RVcmkiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiOGQxNjU4YTQtY2MxZS00MzMwLTg1ZGYtZDQ3NmYzOWQyMGFhIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Byb2Nlc3NSZWdpb24iOiJ1cy1lYXN0LTEifQ.yO0eclw2e16JLHAoeCmY2BMT0qm0tt8TbRDp6_wpLQY'

let storedToken = ''

const testFetcher: FetchInterface = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = input instanceof URL ? input : new URL(input as string)
    const path = url.pathname

    const bodyParams = init?.body ? JSON.parse(init.body as string) : {}

    console.log({path, bodyParams})

    // handle token response
    if(path === '/oauth/token' && ['authorization_code', 'refresh_token'].includes(bodyParams['grant_type'])){
        return new Response(JSON.stringify({
            access_token: 'some-access-token',
            refresh_token: 'some-refresh-token',
            expires_in: (new Date().valueOf() + 60000).toString(),
        }), {
            headers: {'content-type': 'application/json'}
        })
    }

    // handle sites response
    if(path === '/oauth/token/accessible-resources'){
        const sites = [
            {
                id: '1234',
                url: 'https://some-jira-instance.com',
                name: 'gavins site',
                scopes: ['foo', 'bar'],
                avatarUrl: 'https://some-jira-instance.com/avatar.png'
            }
        ]

        return new Response(JSON.stringify(sites), {
            headers: {'content-type': 'application/json'}
        })
    }

    return new Response(JSON.stringify({
        foo: '??????'
    }), {
        status: 200,
        headers: {'content-type': 'application/json'}
    })
}


const initAPI = (): API => {
    const conf = {
        clientId: process.env.PUBLIC_JIRA_APP_CLIENT_ID as string,
        secret: process.env.SECRET_JIRA_APP_SECRET as string,
        redirectUri: process.env.PUBLIC_JIRA_AUTH_REDIRECT_URI as string,
        tokenSetter: (token: string) => storedToken = token,
        tokenGetter: () => storedToken,
        autoRefresh: true,
    }
    

    return new API(conf, testFetcher)
}


const run = async () => {
    // init the api
    const a = initAPI()
    
    // get the auth redirect url
    if(!CODE){
        const authUrl = a.getAuthUrl('some-state')
        console.log({authUrl})
    }

    // get the tokens
    const tokens = await a.getAuthTokens(CODE)
    console.log('test, got tokens', {tokens})

    // list sites
    const sites = await a.listSites()
    console.log('test, got sites: ', {sites, stringified: JSON.stringify(sites, null, 2)})
}

run()






