# Example

```ts
// initialise
const api = API({
    clientId: 'your-client-id',
    secret: 'your-client-secret',
    redirectUri: 'https://yourdomain.com/auth-return',
    tokenSetter: (tokens: TokensResponse ) => cookies.set('auth_token', token),
    tokenGetter: () => cookies.get('auth_token'),
    autoRefresh: true,
})

// get the user auth url
const state = 'some random string'
const url = api.getAuthUrl(state)

// user authorises and we come back with the url
const tokens = await api.getAuthTokens(code, state)
cookies.set('access_tokens', tokens.access_token)

// if autoRefresh is true, it will automatically try to refresh expired tokens
// but you can do it manually
const tokens = await api.refreshAuthTokens()



```