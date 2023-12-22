import {
    APIRequestError,
    AuthError,
    TokensExpiredError,
    TokensRequiredError,
} from '../errors/error.js'
import { allTruthy, isArray, isString, throwIf } from '../utils/utils.js'

type ApiConfig = {
  clientId: string;
  secret: string;
  redirectUri: string;
  tokenSetter: (token: string) => void;
  tokenGetter: () => string;
  autoRefresh?: boolean;
};

class API {
    private urls = {
        authorize: 'https://auth.atlassian.com/authorize',
        tokens: 'https://auth.atlassian.com/oauth/token',
        sites: 'https://api.atlassian.com/oauth/token/accessible-resources',
    }

    private jsonHeaders = {'content-type': 'application/json', accept: 'application/json'}

    private _tokens: TokensResponse | null = null
    /**
   * @throws {TokensRequiredError} tokens have not been set
   * @throws {TokensExpiredError} tokens are expired
   */
    private get tokens(): TokensResponse {
        // are the tokens missing?
        throwIf(!this._tokens, () => new TokensRequiredError())

        const tokens = this._tokens as TokensResponse

        // are the tokens expired?
        const now = new Date()
        const validUntil = tokens.valid_until
        
        throwIf(now > validUntil, () => new TokensExpiredError())

        return tokens
    }

    constructor(
        private config: ApiConfig,
        private fetcher: FetchInterface = fetch,
    ) {}

    getAuthUrl = (state: string): string => {
        const params = new URLSearchParams({
            state,
            audience: 'api.atlassian.com',
            client_id: this.config.clientId,
            scope: 'read:me read:account read:jira-work read:jira-user offline_access',
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            prompt: 'consent',
        })

        return `${this.urls.authorize}?${params.toString()}`
    }

    refreshAuthTokens = async (): Promise<TokensResponse> =>
        this._tokensRequest('refresh', (this._tokens as TokensResponse).refresh_token)

    getAuthTokens = async (code: string): Promise<TokensResponse> =>
        this._tokensRequest('auth', code)

    /**
     * @returns {Promise<{authorization: string, accept: 'application/json', 'content-type': 'application/json'}>}
     * @throws {TokensExpiredError} tokens are expired and config does not allow auto-refresh
     * @throws {TokensRequiredError} tokens are missing
     */
    private async getAuthorisationHeadersWithRefresh(): Promise<{authorization: string, accept: string, 'content-type': string}> {
        try {
            const accessToken = this.tokens.access_token
            return {
                authorization: `Bearer ${accessToken}`,
                ...this.jsonHeaders
            }
        }catch(e) {
            /**
             * If the tokens are expired and config allows auto-refresh, do so.
             * 
             * Otherwise throw the error for user to handle (e.g. the user needs
             * to re-auth)
             */
            if(e instanceof TokensExpiredError && this.config.autoRefresh) {
                const accessToken = (await this.refreshAuthTokens()).access_token
                return {
                    authorization: `Bearer ${accessToken}`,
                    ...this.jsonHeaders
                }
            }
            
            throw e
        }
    }
    
    listSites = async (): Promise<API_SitesResponse> => {
        const headers = await this.getAuthorisationHeadersWithRefresh()

        const res = await this.fetcher(this.urls.sites, {method: 'GET', headers})

        throwIf(!res.ok, () => new APIRequestError('Failed to get sites', res))

        const json = await res.json()

        // assert that the format of the response matches API_SitesResponse
        throwIf(!Array.isArray(json), () => new APIRequestError('Sites response was not an Array', res))
        
        for(const site of json){
            throwIf(!(
                isString(site.id, site.url, site.name, site.avatarUrl) &&
                isArray(site.scopes, 'string')
            ), () => new APIRequestError('Sites response was not valid shape', res))
        }

        return json
    }

    private _tokensRequest = async (
        type: 'auth' | 'refresh',
        codeOrRefreshToken: string,
    ): Promise<TokensResponse> => {
        const code = type === 'auth' ? codeOrRefreshToken : undefined
        const refreshToken = type === 'refresh' ? codeOrRefreshToken : undefined

        throwIf(
            type === 'auth' && !code,
            () => new AuthError('code missing')
        )

        throwIf(
            type === 'refresh' && !refreshToken,
            () => new AuthError('refresh_token missing')
        )

        const bodyParams: Record<string, string> = {
            client_id: this.config.clientId,
            client_secret: this.config.secret,
            grant_type: type === 'auth' ? 'authorization_code' : 'refresh_token',
        }

        if (type === 'auth') {
            bodyParams['redirect_uri'] = this.config.redirectUri
            bodyParams['code'] = code as string
        } else if (type === 'refresh') {
            bodyParams['refresh_token'] = refreshToken as string
        }

        const res = await this.fetcher(this.urls.tokens, {
            method: 'POST',
            headers: this.jsonHeaders,
            body: JSON.stringify(bodyParams),
        })

        throwIf(!res.ok, () => new AuthError('Failed to get auth tokens', res))

        const { access_token, refresh_token, expires_in } = await res.json()

        throwIf(
            !allTruthy({ access_token, refresh_token, expires_in }),
            () => new AuthError('Failed to get auth tokens')
        )

        // set and return new tokens
        return (this._tokens = {
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in: expires_in,
            valid_until: new Date(Date.now() + expires_in * 1000),
        })
    }
}

export default API
